# Glidder - Deploy with Ease

## Overview

Gliiderr is a deployment platform that simplifies the process of deploying web applications using a Git URL. It provides an efficient and streamlined solution for developers to deploy their applications to the cloud with ease. Gliiderr leverages Docker, Node.js, shell scripts, S3 for file uploads and retrieval, and Redis Pub/Sub for real-time logs through sockets, ensuring a seamless deployment experience.

## Repository Structure

The repository is organized into three main folders:

1. **reverse-proxy-server**: This folder contains the reverse proxy server responsible for retrieving files from S3 efficiently using streaming technology.
2. **backend-server**: This folder contains the backend server that provides APIs for managing deployments and interacting with the system.
3. **docker-build-server**: This folder contains the Docker automation scripts used for deploying applications.

## Getting Started

### Prerequisites

- Node.js
- Docker
- AWS S3
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gliiderr.git
   cd gliiderr
   ```

2. Install dependencies for each folder:

   - Reverse Proxy Server:
     ```bash
     cd reverse-proxy-server
     npm install
     ```

   - Backend Server:
     ```bash
     cd ../backend-server
     npm install
     ```

   - Build Docker:
     ```bash
     cd ../build-docker
     npm install
     ```

### Configuration

#### Reverse Proxy Server

1. Create an `.env` file in the `reverse-proxy-server` folder with the following content:
   ```env
   PORT=<your_proxy_server_port>
   S3_BUCKET=<your_s3_bucket_name>
   AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
   AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
   ```

#### Backend Server

1. Create an `.env` file in the `backend-server` folder with the following content:
   ```env
   PORT=<your_backend_server_port>
   DATABASE_URL=<your_database_url>
   REDIS_URL=<your_redis_url>
   ```

#### Build Docker

1. Create an `.env` file in the `build-docker` folder with the following content:
   ```env
   DOCKER_REGISTRY=<your_docker_registry>
   S3_BUCKET=<your_s3_bucket_name>
   ```

### Running the Application

1. Start the Reverse Proxy Server:
   ```bash
   cd reverse-proxy-server
   npm start
   ```

2. Start the Backend Server:
   ```bash
   cd ../backend-server
   npm start
   ```

3. Run the Docker build automation script:
   ```bash
   cd ../build-docker
   npm run deploy
   ```

## Usage

1. Navigate to the Backend Server API endpoint to manage your deployments.
2. Provide your Git URL to deploy your application.
3. Retrieve the deployment URL from the response and access your deployed application.

## Real-Time Logs with Redis Pub/Sub

Gliiderr utilizes Redis Pub/Sub architecture to provide real-time logs to users through sockets. The following outlines the setup and usage of this feature:

### Setting Up Redis

1. Ensure Redis is installed and running. You can start Redis using:
   ```bash
   redis-server
   ```

### Backend Server Configuration

1. In the `backend-server` folder, ensure the Redis URL is correctly set in the `.env` file:
   ```env
   REDIS_URL=<your_redis_url>
   ```

### Implementing Pub/Sub

1. The backend server publishes logs to a Redis channel during the deployment process.
2. The client subscribes to the Redis channel to receive real-time logs via WebSocket.

### Running the Application with Real-Time Logs

1. Start your Redis server.
2. Start the Reverse Proxy Server, Backend Server, and Build Docker scripts as described in the "Running the Application" section.
3. Open the client application to view real-time logs during the deployment process.

