import express from 'express';
import type { Application } from 'express';
import { env } from './config/env.js';

import { documentsRouter } from './routes/documents.js'; // ← NUEVO
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './middlewares/logger.js';
import { notFound } from './middlewares/notFound.js';
import { requestId } from './middlewares/requestId.js';
import { articlesRouter } from './routes/articles.js';
import { questionsRouter } from './routes/questions.js';
import { noticesRouter } from './routes/notices.js';

export function createApp(): Application {
  const app = express();

  app.use(requestId); // first: everything after it can read req.requestId
  if (env.LOG !== 'OFF') {
    app.use(logger);
  }
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/api/v1/articles', articlesRouter);
  app.use('/api/v1/documents', documentsRouter);
  app.use('/api/v1/questions', questionsRouter);
  app.use('/api/v1/notices', noticesRouter);

  app.use(notFound); // only reached when no router answered
  app.use(errorHandler); // always last

  return app;
}
