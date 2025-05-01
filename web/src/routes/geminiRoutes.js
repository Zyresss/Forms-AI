const express = require('express');
const router = express.Router();
const { getGeminiResponse } = require('../controllers/geminiController');

router.get('/', getGeminiResponse);

module.exports = router;