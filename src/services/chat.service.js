const { createAxiosInstance, createCopilotHeaders } = require('../utils/http.utils');
const { getValidToken } = require('../services/auth.service');

const sendChatCompletion = async (chatData, onData, onError, onComplete) => {
  try {
    const token = await getValidToken();
    
    if (!token) {
      throw new Error('No valid token available');
    }
    
    const headers = createCopilotHeaders(token, 'conversation-panel');
    const axios = createAxiosInstance(headers);
    
    const requestData = {
      model: chatData.model || 'gpt-4o',
      temperature: chatData.temperature !== undefined ? chatData.temperature : 0.1,
      top_p: chatData.top_p !== undefined ? chatData.top_p : 1,
      max_tokens: chatData.max_tokens !== undefined ? chatData.max_tokens : 8192,
      n: 1,
      stream: true,
      messages: chatData.messages || []
    };
    
    const response = await axios({
      method: 'post',
      url: 'https://api.individual.githubcopilot.com/chat/completions',
      data: requestData,
      responseType: 'stream'
    });
    
    let buffer = '';
    
    response.data.on('data', (chunk) => {
      try {
        const text = chunk.toString();
        buffer += text;
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.startsWith('data: ')) {
            const dataContent = line.slice(6);
            
            if (dataContent === '[DONE]') {
              onComplete();
              return;
            }
            
            try {
              const parsedData = JSON.parse(dataContent);
              onData(parsedData);
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      } catch (error) {
        onError(error);
      }
    });
    
    response.data.on('error', (error) => {
      onError(error);
    });
    
    response.data.on('end', () => {
      onComplete();
    });
  } catch (error) {
    onError(error);
  }
};

module.exports = {
  sendChatCompletion
};