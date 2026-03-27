import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATALNA GREŠKA: ${key} nije definisan u .env fajlu!`);
    process.exit(1);
  }
}

import express from 'express';
import cors from 'cors';          // ← novo
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import cookieParser from 'cookie-parser';
import refRoutes from './routes/ref.routes';
import sablonRoutes from './routes/sablon.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Statički fajlovi za slike
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ← CORS konfiguracija
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/ref', refRoutes);
app.use('/api/sablon', sablonRoutes);
app.use('/api/users', userRoutes);

const mongoUri = process.env['MONGODB_URI'] as string;
const port = process.env['PORT'] || 3000;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Povezan na MongoDB');
    app.listen(port, () => {
      console.log(`Server sluša na http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Greška baze:', err);
    process.exit(1);
  });
