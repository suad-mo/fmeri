import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { User } from '@nx-fmeri/api-auth';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  await User.deleteMany({});
  console.log('Obrisani postojeći korisnici');

  const admin = new User({
    name: 'admin',
    email: 'admin@fmeri.gov.ba',
    role: ['admin'],
  });
  await admin.setPassword('Admin123!');
  await admin.save();
  console.log('✓ Admin kreiran: admin@fmeri.gov.ba / Admin123!');

  const korisnik = new User({
    name: 'Suad1',
    email: 'suad.krvavac@fmeri.gov.ba',
    role: ['user'],
  });
  await korisnik.setPassword('Suad123!');
  await korisnik.save();
  console.log('✓ Korisnik kreiran: suad.krvavac@fmeri.gov.ba / Suad123!');

  console.log('\n✅ Seed korisnika završen!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
