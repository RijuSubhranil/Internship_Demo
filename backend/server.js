import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js'; 

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Internship Demo API',
      version: '1.0.0',
      description: 'API for Primetrade.ai Backend Assignment with Auth & RBAC',
    },
    servers: [
      {
        url: `https://internship-demo-backend.onrender.com:${process.env.PORT || 8080}`,
        // url: `http://localhost:${process.env.PORT || 8080}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running...' });
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});