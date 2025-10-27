import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import modelsRoutes from './routes/models';
import generationsRoutes from './routes/generations';
import subscriptionsRoutes from './routes/subscriptions';
import imageEditorRoutes from './routes/imageeditor';
import stripeRoutes from './routes/stripe';
import backgroundRemovalRoutes from './routes/background-removal';
import ocrRoutes from './routes/ocr';
import downloadImageRoutes from './routes/download-image';
import { setupVite } from './vite';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors({
  credentials: true,
}));

// Stripe webhook needs raw body
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/generationJobs', generationsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/image-edit', imageEditorRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/background-removal', backgroundRemovalRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api', downloadImageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Graceful error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

setupVite(app, server).then(() => {
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please free the port or use a different one.`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to setup Vite:', error);
  process.exit(1);
});