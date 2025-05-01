const express = require('express');
const { addData, getData } = require('../controllers/dataController');

const router = express.Router();

router.post('/add-data', addData);
router.get('/get-data', getData);

module.exports = router;