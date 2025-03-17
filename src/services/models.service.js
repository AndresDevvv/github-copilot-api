const { createAxiosInstance, createCopilotHeaders } = require('../utils/http.utils');
const { getValidToken } = require('../services/auth.service');

const getAvailableModels = async () => {
  try {
    const token = await getValidToken();
    
    if (!token) {
      throw new Error('No valid token available');
    }
    
    const headers = createCopilotHeaders(token);
    const axios = createAxiosInstance(headers);
    
    const response = await axios.get('https://api.individual.githubcopilot.com/models');
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (typeof response.data === 'object') {
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        return [response.data];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching available models:', error.message);
    throw error;
  }
};

module.exports = {
  getAvailableModels
}; 