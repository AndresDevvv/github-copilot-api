const express = require('express');
const { handleGitHubAuth, startDeviceFlow, checkDeviceFlow, checkTokenStatus } = require('../controllers/auth.controller');

const router = express.Router();


router.post('/github', handleGitHubAuth);


router.get('/device', startDeviceFlow);
router.post('/device/check', checkDeviceFlow);


router.get('/status', checkTokenStatus);

module.exports = router; 