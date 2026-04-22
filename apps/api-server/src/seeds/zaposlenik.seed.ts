import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { User } from '@nx-fmeri/api-auth';
import { Zaposlenik } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  await Zaposlenik.deleteMany({});
  console.log('Obrisani postojeći zaposlenici');

  // Dohvati sve usere koji nisu admin
  const useri = await User.find({ role: { $ne: 'admin' } }).lean();
  console.log(`Pronađeno ${useri.length} korisnika za migraciju`);

  let kreirano = 0;
  let greske = 0;

  for (const user of useri) {
    try {
      // Razdvoji ime i prezime
      const dijelovi = user.name.trim().split(' ');
      const ime = dijelovi[0] ?? '';
      const prezime = dijelovi.slice(1).join(' ') ?? '';

      const zaposlenik = await Zaposlenik.create({
        ime,
        prezime,
        sluzbeniEmail: user.email,
        // slika: user.slika ?? null,
        // organ: user.organizacionaJedinica ? null : null, // Popunit ćemo kroz update
        // organizacionaJedinica: user.organizacionaJedinica ?? null,
        // radnoMjesto: user.radnoMjesto ?? null,
        user: user._id,
        aktivan: true,
      });

      // Ažuriraj User — dodaj referencu na Zaposlenik
      await User.updateOne(
        { _id: user._id },
        { zaposlenik: zaposlenik._id }
      );

      console.log(`  ✓ ${user.name} → Zaposlenik kreiran`);
      kreirano++;
    } catch (err) {
      console.log(`  ⚠️  Greška za ${user.name}:`, err);
      greske++;
    }
  }

  console.log(`\n✅ Migracija završena!`);
  console.log(`   Kreirano: ${kreirano}`);
  console.log(`   Greške: ${greske}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
