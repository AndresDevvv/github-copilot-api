const { sendChatCompletion } = require('../services/chat.service');


const handleChatCompletion = (req, res) => {
  const chatData = req.body;
  
  
  if (!chatData || !chatData.messages || !Array.isArray(chatData.messages) || chatData.messages.length === 0) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Messages array is required'
    });
  }
  
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  
  const onData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  const onError = (error) => {
    console.error('Chat completion error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  };
  
  const onComplete = () => {
    try {
      if (!res.writableEnded && !res.finished) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (error) {
      console.error('Error writing to response stream:', error.message);
      if (!res.writableEnded && !res.finished) {
        res.end();
      }
    }
  };
  
  sendChatCompletion(chatData, onData, onError, onComplete);
};

module.exports = {
  handleChatCompletion
}; 
