import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import adminRoutes from './modules/admin/admin.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import consumerRoutes from './modules/consumers/consumers.routes.js';
import founderRoutes from './modules/founders/founders.routes.js';
import campaignRoutes from './modules/campaigns/campaigns.routes.js';
import discoveryRoutes from './modules/discovery/discovery.routes.js';
import productRoutes from './modules/products/products.routes.js';
import userRoutes from './modules/users/users.routes.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api', generalLimiter);

app.get(
  '/api/health',
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: 'ok', database: 'connected' });
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/founders', founderRoutes);
app.use('/api/consumers', consumerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/discover', discoveryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;