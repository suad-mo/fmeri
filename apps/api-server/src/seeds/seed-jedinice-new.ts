import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import * as fs from 'fs';
import { OrganizacionaJedinica } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  const data = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'data/organizacionajedinicas.json'),
      'utf-8',
    ),
  );

  await OrganizacionaJedinica.deleteMany({});
  console.log('Obrisane postojeće org. jedinice');

  for (const item of data) {
    const {
      _id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      __v,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      nadredjenaJedinica,
      organ,
      rukovodilac,
      ...rest
    } = item;

    await OrganizacionaJedinica.create({
      _id: new mongoose.Types.ObjectId(_id),
      ...rest,
      organ: organ ? new mongoose.Types.ObjectId(organ) : null,
      nadredjenaJedinica: nadredjenaJedinica
        ? new mongoose.Types.ObjectId(nadredjenaJedinica)
        : null,
      rukovodilac: rukovodilac
        ? new mongoose.Types.ObjectId(rukovodilac)
        : null,
    });
  }

  console.log(`✅ Org. jedinice seeded: ${data.length}`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
