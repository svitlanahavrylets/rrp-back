import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import { swaggerDocs } from './swagger.js';

import testRoutes from './routes/testRoute.js';
import createRouter from './routes/createRouter.js';
import projectRoutes from './routes/projectRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import aboutRouter from './routes/aboutRouter.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import servicesRouter from './routes/servicesRouter.js';
import careerRouter from './routes/careersRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//  CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://rrp-gamma.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked request from origin: ${origin}`);
        callback(new Error('CORS not allowed for this origin'));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Swagger Docs
app.use('/api-docs', (req, res, next) => {
  const token = req.query.token;
  if (token === process.env.SWAGGER_TOKEN) {
    return swaggerDocs(app)(req, res, next);
  } else {
    return res.status(403).send('⛔️ Access Denied');
  }
});

app.set('trust proxy', 1);

app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server is working!' });
});

app.use('/api/test', testRoutes);
app.use('/api/about', aboutRouter);
app.use('/api/team', createRouter);
app.use('/api/services', servicesRouter);
app.use('/api/projects', projectRoutes);
app.use('/api/careers', careerRouter);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminAuthRoutes);

app.use('*', notFoundHandler);

app.use(errorHandler);

// MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
