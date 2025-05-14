import express from 'express';
import { addData, getData } from '../controllers/dataController.js';

const router = express.Router();

router.post('/add-data', addData);
router.get('/get-data', getData);

export default router;