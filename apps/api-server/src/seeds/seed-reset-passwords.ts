import * as dotenv from 'dotenv';
import * as path from 'path';

if (process.env['NODE_ENV'] !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../../../.env') });
}

import mongoose from 'mongoose';
import { User } from '@nx-fmeri/api-auth';

const seed = async () => {
  await mongoose.connect(process.env['MONGODB_URI'] as string);
  console.log('Povezan na MongoDB');

  // Koristi direktno MongoDB driver umjesto Mongoose save()
  const db = mongoose.connection.db;
  const collection = db!.collection('users');

  // Dohvati sve usere
  const users = await collection.find({}).toArray();
  console.log(`Pronađeno ${users.length} korisnika`);

  // Generiši hash za svakoga
  const argon2 = await import('argon2');
  const hash = await argon2.hash('Fmeri2026!', {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
  });

  // Ažuriraj sve odjednom
  const result = await collection.updateMany({}, { $set: { hash } });
  console.log(`✅ Lozinka resetovana za ${result.modifiedCount} korisnika`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
