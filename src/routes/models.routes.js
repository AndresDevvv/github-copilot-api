const express = require('express');
const { getModels } = require('../controllers/models.controller');

const router = express.Router();


router.get('/', getModels);

module.exports = router; 