// import express from 'express';

// const host = process.env.HOST ?? 'localhost';
// const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// const app = express();

// app.get('/', (req, res) => {
//   res.send({ message: 'Hello API' });
// });

// app.listen(port, host, () => {
//   console.log(`[ ready ] http://${host}:${port}`);
// });
import * as dotenv from 'dotenv';
import * as path from 'path';
// Učitavanje .env iz root-a
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import cafeRoutes from './routes/cafe.routes';

const app = express();
app.use(express.json());

// Povezivanje ruta
app.use('/api/auth', authRoutes);
app.use('/api/cafe', cafeRoutes); // Dodajemo cafe rute

const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/nx-fmeri';
const port = process.env['PORT'] || 3000;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Povezan na MongoDB');
    app.listen(port, () => {
      console.log(`Server sluša na http://localhost:${port}`);
    });
  })
  .catch(err => console.error('Greška baze:', err));
