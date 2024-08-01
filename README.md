# Nodejs-Web-Deploy-starter

# Node.js Website Template with CI/CD

This repository contains a template for a Node.js-based website with CI/CD for development and production environments using GitHub webhooks and automated deployment scripts.

## Features

- Node.js and Express server setup.
- Redis for session management.
- GitHub webhook integration for CI/CD.
- Deployment scripts for development and production environments.

## Prerequisites

- Node.js
- npm
- Redis
- Git
- Systemd (or any other service manager)
- Bash

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory of your project with the following variables:

```plaintext
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
COOKIE_SECRET=your_cookie_secret
WEBHOOK_SECRET=your_webhook_secret
COOKIE_DOMAIN=.yourdomain.com
NODE_ENV=development

# Deployment specific variables
DEV_DIRECTORY=/path/to/dev/site
PROD_DIRECTORY=/path/to/live/site
DEV_SERVICE_NAME=dev-systemd.service
PROD_SERVICE_NAME=live-systemd.service
```

### Running the Server

To start the server, run:

```bash
node server.js
```

### Setting Up GitHub Webhooks

1. Go to your GitHub repository settings.
2. Navigate to "Webhooks" and click "Add webhook".
3. Set the "Payload URL" to your server's URL followed by `/webhook` (e.g., `https://yourdomain.com/webhook`).
4. Set the "Content type" to `application/json`.
5. Set the "Secret" to the value of `WEBHOOK_SECRET` from your `.env` file.
6. Choose "Just the push event" as the trigger.
7. Save the webhook.

### Deployment Configuration

Ensure your `.env` file contains the following variables:

```plaintext
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
COOKIE_SECRET=your_cookie_secret
WEBHOOK_SECRET=your_webhook_secret
COOKIE_DOMAIN=.yourdomain.com
NODE_ENV=development

# Deployment specific variables
DEV_DIRECTORY=/path/to/dev/site
PROD_DIRECTORY=/path/to/live/site
DEV_SERVICE_NAME=dev-systemd.service
PROD_SERVICE_NAME=live-systemd.service
```

### Example Systemd Service File

Create a systemd service file for both development and production environments. Here is an example for the development environment:

`/etc/systemd/system/dev-systemd.service`

```ini
[Unit]
Description=WEB DOMAIN Node.js Application
Documentation=GITHUB Documentation
After=network.target

[Service]
Environment=NODE_ENV=development
WorkingDirectory=/path/to/web-DEV
ExecStart=/usr/bin/node /path/to/web-DEV/server.js
Restart=on-failure
User=YOUR YOUR WEBUSER
Group=YOUR YOUR WEBUSER
Environment=PATH=/usr/bin:/usr/local/bin

# Ensure the service restarts on errors
Restart=always

[Install]
WantedBy=multi-user.target


```

For production, create a similar file and update the paths and environment variables accordingly.

### Configure Sudo Permissions

To allow YOUR WEBUSER to run the necessary commands without a password, you need to edit the sudoers file:

1. Open the sudoers file:

```bash
sudo visudo
```

2. Add the following line to grant the YOUR WEBUSER permissions to run systemctl commands without a password:

```plaintext
YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/systemctl restart systemd-dev.service
YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/systemctl start systemd-dev.service
YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/systemctl status systemd-dev.service
YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/chmod +x /path/to/web-DEV/deploy.sh

YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/systemctl restart systemd-live.service
YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/systemctl start systemd-live.service
YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/systemctl status systemd-live.service
YOUR WEBUSER ALL=(ALL) NOPASSWD: /bin/chmod +x /path/to/web-LIVE/deploy.sh

```

Replace `YOUR WEBUSER` with the actual username you are using to run your Node.js application.

## Directory Structure

```
your-repo-name/
├── public/                 # Static files
├── views/                  # EJS templates
├── .env                    # Environment variables
├── server.js               # Main server file
├── deploy.sh               # Deployment script
└── README.md               # This README file
```

## License

This project is licensed under the GPL-3.0 License.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
