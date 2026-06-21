import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Allow configured frontend origin(s). Falls back to all in development.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
