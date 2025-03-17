# GitHub Copilot API

A Node.js API for interacting with the GitHub Copilot API, allowing you to authenticate, fetch available models, and send chat completion requests.

## Features

- Authentication via GitHub token or device code flow
- Fetch available Copilot models
- Send chat completion requests with streaming responses
- Web UI for testing the API

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the provided example:
   ```
   PORT=3000
   GITHUB_CLIENT_ID=Iv1.b507a08c87ecfe98
   TOKEN_FILE_PATH=.token
   ```

## Usage

### Start the server

```
npm start
```

For development with auto-restart:
```
npm run dev
```

### API Endpoints

#### Authentication

- `POST /api/auth/github` - Authenticate with a GitHub token
- `GET /api/auth/device` - Start device code flow for authentication
- `POST /api/auth/device/check` - Check device code flow status
- `GET /api/auth/status` - Check authentication status

#### Models

- `GET /api/models` - Get available models

#### Chat

- `POST /api/chat/completions` - Send a chat completion request

## Web UI

The application includes a web UI for testing the API. Access it by navigating to the root URL in your browser:

```
http://localhost:3000
```

The UI allows you to:

1. Authenticate using either a GitHub token or device code flow
2. Fetch and view available models
3. Send chat completion requests and view streaming responses

## Authentication Methods

### GitHub Token

1. Obtain a GitHub Personal Access Token with appropriate permissions
2. Enter it in the web UI or send it to the `/api/auth/github` endpoint

### Device Code Flow

1. Start the flow by accessing the device code endpoint
2. Visit the GitHub device activation page and enter the provided code
3. The application will poll GitHub until authentication is complete

## License

MIT 