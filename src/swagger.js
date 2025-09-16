import 'dotenv/config';
import swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const SERVER_URL =
  NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : process.env.SERVER_URL || 'https://rrp-back.onrender.com';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
    description: 'Form saving and email distribution',
  },
  servers: [
    {
      url: SERVER_URL,
      description:
        NODE_ENV === 'development' ? 'Local dev server' : 'Production server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, './routes/**/*.js')],
};

console.log(
  '🔍 Swagger is looking in:',
  path.join(__dirname, './routes/**/*.js'),
);
console.log('NODE_ENV =', NODE_ENV);

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve);

  const guard = (req, res, next) => {
    if (NODE_ENV !== 'production') return next();
    if (req.query?.token === process.env.SWAGGER_TOKEN) return next();
    return res.status(403).send('⛔️ Access Denied. Token required.');
  };

  if (NODE_ENV === 'production' && !process.env.SWAGGER_TOKEN) {
    console.warn('⚠️ SWAGGER_TOKEN is not set in production.');
  }

  app.get('/api-docs', guard, swaggerUi.setup(swaggerSpec, { explorer: true }));

  if (NODE_ENV === 'development') {
    console.log('📚 Swagger available at: http://localhost:5000/api-docs');
  } else {
    console.log('📚 Swagger protected at: /api-docs?token=YOUR_SECRET');
  }
};
