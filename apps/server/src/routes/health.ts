import { Router, Request, Response } from 'express';
import { getDBStatus } from '../config/database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDBStatus();

  res.json({
    success: true,
    data: {
      service: 'MOOLA API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: {
        connected: db.connected,
        host: db.host,
        name: db.name,
      },
    },
    message: 'MOOLA API is running',
  });
});

export default router;
