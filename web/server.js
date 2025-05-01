const app = require('./src/app');
const { connectToDB } = require('./src/config/dbConfig');

const port = 3000;
const webAdress = `http://localhost:${port}`;

(async () => {
    try {
        await connectToDB();
        app.listen(port, () => console.log(`Server running at ${webAdress}`));
    }
    catch (error) {
        console.error('Failed to start server: ', error);
        process.exit(1);
    }
})();