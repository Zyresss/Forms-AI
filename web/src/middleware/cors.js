import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

const configuredCors = cors(corsOptions);

export default configuredCors;