const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
require('dotenv').config();

const app = express();
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.connect().catch(console.error);

// Trust proxy
app.set('trust proxy', 1); // Trust first proxy

// Configure Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const isProduction = process.env.NODE_ENV === 'production';

// Session configuration with cookie expiration
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProduction, // Set secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 24 hours
    domain: process.env.COOKIE_DOMAIN || '.YourDomain',
    sameSite: 'Lax'
  }
}));

// Middleware to verify GitHub webhook signature
function verifyWebhook(req, res, next) {
  const signature = req.headers['x-hub-signature'];
  const payload = JSON.stringify(req.body);

  if (!signature) {
    console.log('No signature found');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const secret = process.env.WEBHOOK_SECRET;
  const hmac = crypto.createHmac('sha1', secret);
  const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8');
  const checksum = Buffer.from(signature, 'utf8');

  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    console.log('Signature mismatch');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  next();
}

// GitHub webhook endpoint with secret verification
app.post('/webhook', verifyWebhook, (req, res) => {
  try {
    const payload = req.body;
    console.log('Webhook received:', payload);

    // Determine the branch from the webhook payload
    const branch = payload.ref.split('/').pop();
    console.log('Branch:', branch);

    // Set the appropriate directory based on the branch
    let deployScript;
    if (branch === 'dev') {
      deployScript = '/path/to/dev/site/deploy.sh';
    } else if (branch === 'master') {
      deployScript = '/path/to/live/site/deploy.sh';
    } else {
      console.log('Received a webhook event from GitHub, but it is not for the dev or master branch.');
      return res.status(200).send('Webhook received but not for the dev or master branch.');
    }

    console.log(`Executing deploy script for ${branch} branch`);

    // Execute deploy.sh script with the branch as an argument
    exec(`${deployScript} ${branch}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing deploy.sh for ${branch}: ${error.message}`);
        return res.status(500).send(`Deployment script for ${branch} failed`);
      }
      if (stderr) {
        console.error(`Deployment script stderr for ${branch}: ${stderr}`);
      }
      console.log(`Deployment script stdout for ${branch}: ${stdout}`);
      res.status(200).send(`Webhook received and deployment for ${branch} triggered successfully`);
    });
  } catch (err) {
    console.error('An error occurred:', err);
    res.status(500).send('An internal server error occurred');
  }
});

// Serve static files from the "public" directory
app.use(express.static('public'));

/*

Your wesbite pages here

*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
