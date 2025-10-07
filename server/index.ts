import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import modelsRoutes from './routes/models';
import generationsRoutes from './routes/generations';
import subscriptionsRoutes from './routes/subscriptions';
import { setupVite } from './vite';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/generations', generationsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

setupVite(app, server).then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to setup Vite:', error);
  process.exit(1);
});
