import { getDB } from '../config/dbConfig.js';

const myCollection = 'my collection';

export const addData = async (request, response) => {
    try {
        console.log('Request received: ', request.body);
        
        const database = getDB();
        console.log('Message from dataController.js: Connected to database');

        const collection = database.collection(myCollection);
        console.log('Connected to collection');

        const result = await collection.insertOne(request.body);
        console.log('Data inserted:', result);

        return response.status(201).json({ message: 'User created successfully', id: result.insertedId });
    }
    catch (error) {
        console.error('Error in addData:', error);
        response.status(500).json({ message: 'Failed to create user' });
    }
};

export const getData = async (request, response) => {
    try {
        const database = getDB();
        console.log('Message from dataController.js: Connected to database');

        const collection = database.collection(myCollection);
        console.log('Connected to collection');

        const data = await collection.find({}, {
            projection: {
              'Last Name': 1,
              'First Name': 1,
              'Date of Birth': 1,
              'Email Address': 1,
              'Phone Number': 1,
              'Home Address': 1,
              'Desired Degree Program': 1,
              _id: 0
            }
          }).toArray();
        console.log('Data fetched: ', data);
        return response.status(200).json(data);
    }
    catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Error fetching users' });
    }
};