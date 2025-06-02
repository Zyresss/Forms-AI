import { response } from 'express';
import { getDB } from '../config/dbConfig.js';

export const sendForm = async (request, response) => {
    try {
        console.log('Starting sendForm() execution!\n');
        console.log('Request received: ' + request.body + '.\n');
        
        const database = getDB();
        console.log('Message from dataController.js (sendForm): Connected to database.\n');

        const collection = database.collection('admin-form');
        console.log('Connected to collection (admin-form).\n');

        const result = await collection.insertOne(request.body);
        console.log('Form inserted into collection:' + result + '.\n');

        return response.status(201).json({ message: 'Form inserted into admin-form successfully', id: result.insertedId });
    }
    catch (error) {
        console.error('Error inserting form into admin-form:' + error + '.\n');
        response.status(500).json({ message: 'Failed to insert form' });
    }
}

export const getForms = async (request, response) => {
    try {
        console.log('Starting getForms() execution!\n');

        const database = getDB();
        console.log('Message from dataController.js (getForms): Connected to database.\n');

        const collection = database.collection('admin-form');
        console.log('Connected to collection (admin-form).\n');

        const data = await collection.find({}, {
            projection: {
              _id: 0
            }
          }).toArray();
        console.log('Data retreived:' + data + '\n');

        return response.status(201).json(data);
    }
    catch (error) {
        console.error('Error getting forms from admin-form:' + error + '.\n');
        response.status(500).json({ message: 'Failed to get forms' });
    }
}

export const sendFormData = async (request, response) => {
    try {
        console.log('Starting sendFormData() execution!\n')
        
        const database = getDB();
        console.log('Message from dataController.js (sendFormData): Connected to database');

        const collectionName = request.body.CN + '';
        const collection = database.collection(collectionName);
        console.log(`Connected to collection (${collectionName}).\n`);

        const fileMap = {};
        request.files.forEach((file) => {
            fileMap[file.originalname] = {
                originalName: file.originalName,
                mimeType: file.mimeType,
                size: file.size,
                buffer: file.buffer
            };
        });

        const fullData = {
            ...request.body,
            files: fileMap
        };

        const result = await collection.insertOne(fullData);
        console.log(`Form data inserted into (${collectionName}) successfully: ${result}\n`);

        return response.status(201).json({ message: 'Form data inserted successfully', id: result.insertedId });
    }
    catch (error) {
        console.error('Error in sending form data (sendFormData):', error);
        response.status(500).json({ message: 'Failed to insert form data' });
    }
}

export const deleteForm = async (request, response) => {
    try {
        console.log('Starting deleteForm execution!\n');
        console.log('Request received: ' + request.body + '.\n');

        const database = getDB();
        console.log('Message from dataController.js (deleteForm): Connected to database');

        const collection = database.collection('admin-form');
        console.log('Connected to collection (admin-form).\n');

        const index = request.body.index;
        console.log('form index is: ', index);

        const deleteFormResult = await collection.deleteOne({ formIndex: index });
        console.log('deleteFormResult: ', deleteFormResult);

        await database.collection(index).drop();

        return response.status(200).json({ message: 'Form and collection deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting form & collection (deleteForm):', error);
        response.status(500).json({ message: 'Failed to delete form & collection (deleteForm)' });
    }
}

let formIndex = null;
export const sendFormIndex = async (request, response) => {
    try {
        console.log('Starting sendFormIndex() execution!\n');
        console.log('Request received: ' + request.body + '.\n');

        formIndex = request.body.index;
        console.log('formIndex recieved: ', formIndex);

        return response.status(201).json({ message: 'Form index received successfully' });
    }
    catch (error) {
        console.error('Error in sendFormIndex (Failed to recieve form index):', error);
        response.status(500).json({ message: 'Failed to receive form index' });
    }
}

export const getFormData = async (request, response) => {
    const formIndex = request.query.index;
    
    if (!formIndex) {
        console.error('An error occured when receiving form index from sendFormIndex');
        return response.json({ message: 'Form index is undefined' });
    }

    try {
        console.log('Starting getFormData() execution!\n');

        const database = getDB();
        console.log('Message from dataController.js (getFormData): Connected to database.\n');

        console.log('Collection name: ', formIndex);
        const collection = database.collection(formIndex);
        console.log('Connected to collection!\n');

        const data = await collection.find({}, {
            projection: {
              _id: 0
            }
          }).toArray();
        console.log('Form data retreived:', data);

        return response.status(201).json(data);
    }
    catch (error) {
        console.error('Error in getFormData (Failed to retreive form data):', error);
        response.status(500).json({ message: 'Failed to retreive form data' });
    }
}

export const getFormIndexes = async (request, response) => {
    try {
        console.log('Starting getFormIndexes() execution!\n');
        console.log('Request received: ', request.body);

        const database = getDB();
        console.log('Message from dataController.js (sendFormIndexes):Conneted to database.\n');

        const fullData = [];
        for (const collectionName of request.body) {
            console.log(`Fetching from collection ${collectionName}.\n`);
            const collection = database.collection(collectionName);
            const data = await collection.find({}, {
                projection: {
                    _id: 0
                }
            }).toArray();

            fullData.push(data);
        }
        
        return response.status(200).json(fullData);
    }
    catch (error) {
        console.error('An error occured when sending form indexes to the server');
        return response.status(500).json({ message: 'Failed to retreive form indexes' });
    }
}

export const downloadFile = async (request, response) => {
    const formIndex = request.params.formIndex;
    const fileName = decodeURIComponent(request.params.fileName);

    try {
        const database = getDB();
        const collection = database.collection(formIndex);
        console.log('Connected to collection:', formIndex);
        console.log('Looking for file:', fileName);
        console.log('formIndex: ', formIndex);

        // Fetch all documents and find the one containing the file
        const documents = await collection.find({}).toArray();
        const document = documents.find(doc => doc.files && Object.prototype.hasOwnProperty.call(doc.files, fileName));
        console.log(document);

        if (!document || !document.files || !document.files[fileName]) {
            return response.status(404).json({ message: 'File not found' });
        }

        const file = document.files[fileName];

        if (!file || !file.buffer) {
            return response.status(404).json({ message: 'File data missing' });
        }

        response.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        if (file.buffer._bsontype === 'Binary' && file.buffer.buffer) {
            return response.send(file.buffer.buffer);
        }

        if (Buffer.isBuffer(file.buffer)) {
            return response.send(file.buffer);
        }

        return response.send(Buffer.from(file.buffer));
    } catch (error) {
        console.error('Error during file download:', error);
        return response.status(500).json({ message: 'Failed to download file' });
    }
};

export const getAllFormsData = async (request, response) => {
    try {
        console.log('Starting getAllFormsData() execution!\n');

        const database = getDB();
    }
    catch (error) {
        console.error('An error occered when retreiving data from MongoDB');
        return response.status(500).json({ message: 'Failed to get form data' });
    }
}