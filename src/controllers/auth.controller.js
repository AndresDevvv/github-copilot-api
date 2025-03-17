const { getCopilotToken, startDeviceCodeFlow, pollForAccessToken, getValidToken } = require('../services/auth.service');


const handleGitHubAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'GitHub token is required' });
    }
    
    const copilotToken = await getCopilotToken(token);
    
    return res.status(200).json({ 
      success: true,
      message: 'GitHub authentication successful',
      token: copilotToken.substring(0, 20) + '...' 
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    return res.status(401).json({ 
      error: 'GitHub authentication failed',
      message: error.message
    });
  }
};


const startDeviceFlow = async (req, res) => {
  try {
    const deviceCodeData = await startDeviceCodeFlow();
    
    return res.status(200).json({
      success: true,
      data: deviceCodeData
    });
  } catch (error) {
    console.error('Device code flow error:', error);
    return res.status(500).json({
      error: 'Failed to start device code flow',
      message: error.message
    });
  }
};


const checkDeviceFlow = async (req, res) => {
  try {
    const { device_code } = req.body;
    
    if (!device_code) {
      return res.status(400).json({ error: 'Device code is required' });
    }
    
    const tokenData = await pollForAccessToken(device_code);
    
    if (tokenData.error) {
      return res.status(202).json({
        success: false,
        status: 'pending',
        error: tokenData.error,
        error_description: tokenData.error_description
      });
    }
    
    if (tokenData.access_token) {
      
      const copilotToken = await getCopilotToken(tokenData.access_token);
      
      return res.status(200).json({
        success: true,
        status: 'complete',
        message: 'Authentication successful',
        token: copilotToken.substring(0, 20) + '...' 
      });
    }
    
    return res.status(500).json({
      error: 'Unexpected response from GitHub',
      data: tokenData
    });
  } catch (error) {
    console.error('Check device flow error:', error);
    return res.status(500).json({
      error: 'Failed to check device flow status',
      message: error.message
    });
  }
};


const checkTokenStatus = async (req, res) => {
  try {
    const token = await getValidToken();
    
    return res.status(200).json({
      success: true,
      hasToken: !!token,
      isValid: !!token
    });
  } catch (error) {
    console.error('Token status check error:', error);
    return res.status(500).json({
      error: 'Failed to check token status',
      message: error.message
    });
  }
};

module.exports = {
  handleGitHubAuth,
  startDeviceFlow,
  checkDeviceFlow,
  checkTokenStatus
}; 