import app from './app.js';
import { prisma } from './config/db.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`Validly API running on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);