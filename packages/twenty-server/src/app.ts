import express from 'express';

import { requireAuth } from './routes/auth';
import { dashboardRouter } from './routes/dashboard';
import { dashboardPresetsRouter } from './routes/dashboardPresets';

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/healthz', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  app.use('/api/dashboard', requireAuth, dashboardRouter);
  app.use('/api/dashboard', requireAuth, dashboardPresetsRouter);

  return app;
};
