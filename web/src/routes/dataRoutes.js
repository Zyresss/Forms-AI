import express from 'express';
import multer from 'multer';
import { sendForm,
         getForms, sendFormData,
         deleteForm,
         sendFormIndex, getFormData, getAllFormsData, getFormIndexes, 
         downloadFile}
from '../controllers/dataController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// This is for form-generator.html
router.post('/save-form', sendForm);

// These is for form-selector.html
router.get('/get-forms', getForms);
router.post('/send-form-data', upload.any(), sendFormData);

// These is for admin.html
router.post('/send-index', sendFormIndex);
router.get('/get-form-data', getFormData);
router.post('/get-all-forms-data', getAllFormsData)
router.post('/send-form-indexes', getFormIndexes);
router.get('/download/:formIndex/:fileName', downloadFile);

// This is for both form-selector.html & admin.html
router.delete('/delete-form', deleteForm);

export default router;