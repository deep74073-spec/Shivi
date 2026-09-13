import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// API Routes Router
app.use('/api', apiRoutes);

// Health & Identity Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    app: 'SHIVI AI Core Backend',
    creator: 'Deepak',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[SHIVI Server Error]:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred in SHIVI backend.'
  });
});

app.listen(PORT, () => {
  console.log(`[SHIVI Core API] Running on port ${PORT}`);
});

export default app;
