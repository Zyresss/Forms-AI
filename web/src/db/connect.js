import { MongoClient } from 'mongodb';

const url = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

export async function connectToDB() {
    const client = await MongoClient.connect(url);
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    global.db = db;
}