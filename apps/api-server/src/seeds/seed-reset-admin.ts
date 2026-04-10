import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { User } from '@nx-fmeri/api-auth';

const seed = async () => {
  await mongoose.connect(process.env['MONGODB_URI'] as string);

  const user = await User.findById('69d8c13905bf2fa1a7d1ffdf');
  if (!user) {
    console.log('❌ Admin nije pronađen');
    process.exit(1);
  }

  await user.setPassword('Admin123!');
  await user.save();

  console.log('✅ Admin lozinka resetovana na: Admin123!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
