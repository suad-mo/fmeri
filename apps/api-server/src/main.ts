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

const app = express();

// ← CORS konfiguracija
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

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
