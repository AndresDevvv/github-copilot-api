const { getAvailableModels } = require('../services/models.service');


const getModels = async (req, res) => {
  try {
    const models = await getAvailableModels();
    
    
    const modelsArray = Array.isArray(models) ? models : [models];
    
    return res.status(200).json({
      success: true,
      data: modelsArray
    });
  } catch (error) {
    console.error('Error getting models:', error);
    return res.status(500).json({
      error: 'Failed to fetch available models',
      message: error.message
    });
  }
};

module.exports = {
  getModels
}; 