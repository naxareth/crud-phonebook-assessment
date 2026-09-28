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

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Enable CORS for development
app.use(cors());

// Parse JSON bodies with strict 16kb payload limit to prevent DoS
app.use(express.json({ limit: '16kb' }));

// Handle invalid JSON body syntax errors gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
  }
  next(err);
});

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

// Serve frontend in production or if dist exists
const clientDistPath = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../client/dist')
].find((p) => fs.existsSync(p));

if (clientDistPath) {
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
  const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
  
  // Return specific messages only for 4xx client errors; return generic message for 500 server errors
  const message = status < 500 && err.message
    ? err.message
    : 'An unexpected server error occurred.';

  res.status(status).json({
    error: message
  });
});

export default app;
