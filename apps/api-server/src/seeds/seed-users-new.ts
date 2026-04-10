import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import * as fs from 'fs';
import { User } from '@nx-fmeri/api-auth';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf-8'),
  );

  await User.deleteMany({});
  console.log('Obrisani postojeći korisnici');

  for (const item of data) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, createdAt, updatedAt, zaposlenik, ...rest } = item;

    await User.create({
      _id: new mongoose.Types.ObjectId(_id),
      ...rest,
      zaposlenik: zaposlenik ? new mongoose.Types.ObjectId(zaposlenik) : null,
    });
  }

  console.log(`✅ Korisnici seeded: ${data.length}`);

  // Na kraju seed funkcije, prije disconnect:
  const adminUser = await User.findOne({ email: 'admin@fmeri.gov.ba' });
  if (adminUser) {
    await adminUser.setPassword('Admin123!');
    await adminUser.save();
    console.log('✅ Admin lozinka postavljena');
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
