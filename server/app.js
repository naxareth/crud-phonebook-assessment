import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import contactsRouter from './routes/contacts.js';
import { isConfigured } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for development
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// API Health / Config status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    configured: isConfigured(),
    timestamp: new Date().toISOString()
  });
});

// Mount Contacts API Routes
app.use('/api/contacts', contactsRouter);

// Serve frontend in production or if client/dist exists
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for frontend routes (must come after API routes)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Server Internal Error]', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred.';
  
  res.status(status).json({
    error: message
  });
});

export default app;
