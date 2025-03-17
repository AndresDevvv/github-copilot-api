const axios = require('axios');

const createAxiosInstance = (headers = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  return axios.create({
    headers: {
      ...defaultHeaders,
      ...headers
    },
    timeout: 30000
  });
};

const createCopilotHeaders = (token, intentType = 'model-access') => {
  return {
    'authorization': `Bearer ${token}`,
    'copilot-integration-id': 'vscode-chat',
    'editor-plugin-version': 'copilot-chat/0.25.1',
    'editor-version': 'vscode/1.98.2',
    'openai-intent': intentType,
    'user-agent': 'GitHubCopilotChat/0.25.1',
    'x-github-api-version': '2024-12-15'
  };
};

const createGitHubHeaders = (token) => {
  return {
    'authorization': `token ${token}`,
    'editor-plugin-version': 'copilot-chat/0.25.1',
    'editor-version': 'vscode/1.98.2',
    'user-agent': 'GitHubCopilotChat/0.25.1',
    'x-github-api-version': '2024-12-15'
  };
};

module.exports = {
  createAxiosInstance,
  createCopilotHeaders,
  createGitHubHeaders
};