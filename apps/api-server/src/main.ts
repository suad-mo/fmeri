import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// ← ENV VALIDACIJA: provjeri obavezne varijable odmah pri startu
const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATALNA GREŠKA: ${key} nije definisan u .env fajlu!`);
    process.exit(1); // Zaustavi server odmah
  }
}

import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// const mongoUri = process.env['MONGODB_URI']!; // ! je sigurno jer smo provjerili gore
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
    process.exit(1); // ← I ovdje — ne ostavljaj server u broken stanju
  });
