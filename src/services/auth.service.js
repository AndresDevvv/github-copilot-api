const { createAxiosInstance, createGitHubHeaders } = require('../utils/http.utils');
const { saveToken, getToken, isTokenExpired } = require('../utils/token.utils');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Iv1.b507a08c87ecfe98';

const getCopilotToken = async (githubToken) => {
  try {
    const headers = createGitHubHeaders(githubToken);
    const axios = createAxiosInstance(headers);
    
    const response = await axios.get('https://api.github.com/copilot_internal/v2/token');
    
    if (response.data && response.data.token) {
      await saveToken(response.data.token);
      return response.data.token;
    }
    
    throw new Error('Failed to obtain Copilot token');
  } catch (error) {
    console.error('Error getting Copilot token:', error.message);
    throw error;
  }
};

const startDeviceCodeFlow = async () => {
  try {
    const axios = createAxiosInstance();
    
    const response = await axios.post('https://github.com/login/device/code', {
      client_id: GITHUB_CLIENT_ID,
      scope: 'read:user'
    });
    
    if (typeof response.data === 'string') {
      const params = new URLSearchParams(response.data);
      return {
        device_code: params.get('device_code'),
        user_code: params.get('user_code'),
        verification_uri: params.get('verification_uri') || 'https://github.com/login/device',
        expires_in: parseInt(params.get('expires_in') || '900', 10),
        interval: parseInt(params.get('interval') || '5', 10)
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error starting device code flow:', error.message);
    throw error;
  }
};

const pollForAccessToken = async (deviceCode) => {
  try {
    const axios = createAxiosInstance();
    
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    });
    
    if (typeof response.data === 'string') {
      const params = new URLSearchParams(response.data);
      
      if (params.get('error')) {
        return {
          error: params.get('error'),
          error_description: params.get('error_description')
        };
      }
      
      return {
        access_token: params.get('access_token'),
        token_type: params.get('token_type'),
        scope: params.get('scope')
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error polling for access token:', error.message);
    throw error;
  }
};

const getValidToken = async () => {
  try {
    const token = await getToken();
    
    if (token && !isTokenExpired(token)) {
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting valid token:', error.message);
    return null;
  }
};

module.exports = {
  getCopilotToken,
  startDeviceCodeFlow,
  pollForAccessToken,
  getValidToken
};