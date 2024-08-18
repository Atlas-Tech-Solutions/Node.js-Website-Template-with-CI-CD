#!/bin/bash

# Function to deploy a specific branch
deploy() {
  local branch=$1
  local directory=$2
  local service_name=$3
  local logfile="$directory/deploy.log"

  echo "Starting deployment for branch $branch..." | tee -a $logfile

  # Navigate to the project directory
  cd $directory || { echo "Failed to navigate to project directory. Aborting deployment." | tee -a $logfile; exit 1; }

  # Reset any local changes and sync with the remote repository
  echo "Resetting local changes..." | tee -a $logfile
  if git fetch origin && git reset --hard origin/$branch; then
      echo "Local changes reset successfully." | tee -a $logfile
  else
      echo "Failed to reset local changes. Aborting deployment." | tee -a $logfile
      exit 1
  fi

  # Attempt to make deploy.sh executable
  echo "Making deploy script deployable" | tee -a $logfile
  if sudo /bin/chmod +x $directory/deploy.sh; then
      echo "Successfully made deploy script executable" | tee -a $logfile
  else
      echo "Failed to make deploy script executable" | tee -a $logfile
      exit 1
  fi

  # Install/update dependencies
  if npm install; then
      echo "Dependencies installed/updated successfully." | tee -a $logfile
  else
      echo "Failed to install/update dependencies. Aborting deployment." | tee -a $logfile
      exit 1
  fi

  # Restart the systemd service using the allowed systemctl command
  echo "Attempting to restart the service..." | tee -a $logfile
  if sudo /bin/systemctl restart $service_name; then
      echo "Service restarted successfully." | tee -a $logfile
  else
      echo "Failed to restart service. Manual intervention may be required." | tee -a $logfile
      systemctl_status=$(sudo systemctl status $service_name)
      echo "Systemctl status: $systemctl_status" | tee -a $logfile
      exit 1
  fi

  echo "Deployment completed successfully." | tee -a $logfile
}

# Determine the branch from the argument or from the current git branch
if [ -n "$1" ]; then
  branch=$1
else
  branch=$(git rev-parse --abbrev-ref HEAD)
fi

# Set the directory and service name based on the branch
if [ "$branch" == "master" ]; then
  deploy "master" "/opt/atlas-tech-solutions-LIVE" "atlastechsolutions-live.service"
elif [ "$branch" == "dev" ]; then
  deploy "dev" "/opt/atlas-tech-solutions-DEV" "atlastechsolutions-dev.service"
else
  echo "Branch $branch is not configured for deployment. Aborting."
  exit 1
fi
