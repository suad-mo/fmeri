import * as dotenv from 'dotenv';
import * as path from 'path';

// Učitaj .env samo u development
if (process.env['NODE_ENV'] !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
}

const REQUIRED_ENV = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI',
] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATALNA GREŠKA: ${key} nije definisan u .env fajlu!`);
    process.exit(1);
  }
}

import express from 'express';
import cors from 'cors'; // ← novo
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import cookieParser from 'cookie-parser';
import refRoutes from './routes/ref.routes';
import sablonRoutes from './routes/sablon.routes';
import userRoutes from './routes/user.routes';
import statsRoutes from './routes/stats.routes';
import zaposlenikRoutes from './routes/zaposlenik.routes';

import organRoutes from './routes/organ.routes';
import izvjestajRoutes from './routes/izvjestaj.routes';
const app = express();

// Statički fajlovi za slike
// Zamijeni postojeću liniju za statičke fajlove
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../../../../uploads')),
);

// ← CORS konfiguracija
const allowedOrigins =
  process.env['NODE_ENV'] === 'production'
    ? true // U produkciji Nginx proxira, dozvolimo sve
    : ['http://localhost:4200', 'http://localhost'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);
// app.use(cors({
//   origin: 'http://localhost:4200',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/ref', refRoutes);
app.use('/api/sablon', sablonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/organi', organRoutes);
app.use('/api/zaposlenici', zaposlenikRoutes);
app.use('/api/izvjestaj', izvjestajRoutes);

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
