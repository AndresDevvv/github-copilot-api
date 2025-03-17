const express = require('express');
const { handleChatCompletion } = require('../controllers/chat.controller');

const router = express.Router();


router.post('/completions', handleChatCompletion);

module.exports = router; 