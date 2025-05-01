const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

async function connectToDB() {
    const client = await MongoClient.connect(url);
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    global.db = db;
}

module.exports = connectToDB;