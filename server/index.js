import app from './app.js';
import { config, isConfigured } from './config.js';

const server = app.listen(config.port, () => {
  console.log(`========================================`);
  console.log(` Phonebook Express API running on port ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Supabase configured: ${isConfigured() ? 'YES' : 'NO (Check .env)'}`);
  console.log(`========================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
