import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { GlobalniSablon } from '@nx-fmeri/api-sablon';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  await GlobalniSablon.deleteMany({});
  console.log('Obrisani postojeći globalni šabloni');

  // ── Šablon za ministarstvo ──────────────────────────
  await GlobalniSablon.create({
    tipOrgana: 'ministarstvo',
    naziv: 'Šablon federalnog ministarstva',
    pravniOsnov: 'Uredba o načelima za unutrašnju organizaciju federalnih organa uprave, Član 10.',
    opis: 'Osnovna organizacijska šema za federalna ministarstva',
    osnovneJedinice: [
      {
        tip: 'kabinet',
        naziv: 'Kabinet',
        obavezna: true,
        minBroj: 1,
        maxBroj: 1,
        roditeljTipovi: ['ministarstvo'],
      },
      {
        tip: 'sektor',
        naziv: 'Sektor',
        obavezna: true,
        minBroj: 1,
        maxBroj: null,
        roditeljTipovi: ['ministarstvo'],
      },
      {
        tip: 'odjeljenje',
        naziv: 'Odjeljenje',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['ministarstvo'],
      },
      {
        tip: 'inspektorat',
        naziv: 'Inspektorat',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['ministarstvo'],
      },
      {
        tip: 'centar',
        naziv: 'Centar',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['ministarstvo'],
      },
      {
        tip: 'servis',
        naziv: 'Servis',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['ministarstvo'],
      },
      {
        tip: 'sluzba',
        naziv: 'Služba',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['ministarstvo'],
      },
    ],
    unutrašnjeJedinice: [
      {
        tip: 'odsjek',
        naziv: 'Odsjek',
        obavezna: false,
        minBroj: 2,
        maxBroj: null,
        roditeljTipovi: ['sektor', 'odjeljenje', 'inspektorat'],
      },
      {
        tip: 'grupa',
        naziv: 'Grupa',
        obavezna: false,
        minBroj: 2,
        maxBroj: null,
        roditeljTipovi: ['sektor', 'odjeljenje', 'centar', 'servis', 'sluzba'],
      },
      {
        tip: 'pisarnica',
        naziv: 'Pisarnica',
        obavezna: false,
        minBroj: 0,
        maxBroj: 1,
        roditeljTipovi: ['sektor', 'odjeljenje', 'sluzba'],
      },
      {
        tip: 'arhiva',
        naziv: 'Arhiva',
        obavezna: false,
        minBroj: 0,
        maxBroj: 1,
        roditeljTipovi: ['sektor', 'odjeljenje', 'sluzba'],
      },
      {
        tip: 'racunovodstvo',
        naziv: 'Računovodstvo',
        obavezna: false,
        minBroj: 0,
        maxBroj: 1,
        roditeljTipovi: ['sektor', 'odjeljenje', 'sluzba'],
      },
    ],
  });
  console.log('✓ Šablon ministarstva kreiran');

  // ── Šablon za zavod ─────────────────────────────────
  await GlobalniSablon.create({
    tipOrgana: 'zavod',
    naziv: 'Šablon federalnog zavoda',
    pravniOsnov: 'Zakon o organizaciji organa uprave u FBiH, Član 7. tačka 4.',
    opis: 'Organizacijska šema za federalne zavode kao upravne organizacije',
    osnovneJedinice: [
      {
        tip: 'sektor',
        naziv: 'Sektor',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['zavod'],
      },
      {
        tip: 'odjeljenje',
        naziv: 'Odjeljenje',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['zavod'],
      },
      {
        tip: 'centar',
        naziv: 'Centar',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['zavod'],
      },
    ],
    unutrašnjeJedinice: [
      {
        tip: 'odsjek',
        naziv: 'Odsjek',
        obavezna: false,
        minBroj: 2,
        maxBroj: null,
        roditeljTipovi: ['sektor', 'odjeljenje'],
      },
      {
        tip: 'grupa',
        naziv: 'Grupa',
        obavezna: false,
        minBroj: 2,
        maxBroj: null,
        roditeljTipovi: ['sektor', 'odjeljenje', 'centar'],
      },
    ],
  });
  console.log('✓ Šablon zavoda kreiran');

  // ── Šablon za direkciju ─────────────────────────────
  await GlobalniSablon.create({
    tipOrgana: 'direkcija',
    naziv: 'Šablon federalne direkcije',
    pravniOsnov: 'Zakon o organizaciji organa uprave u FBiH, Član 7. tačka 4.',
    opis: 'Organizacijska šema za federalne direkcije kao upravne organizacije',
    osnovneJedinice: [
      {
        tip: 'sektor',
        naziv: 'Sektor',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['direkcija'],
      },
      {
        tip: 'odjeljenje',
        naziv: 'Odjeljenje',
        obavezna: false,
        minBroj: 0,
        maxBroj: null,
        roditeljTipovi: ['direkcija'],
      },
    ],
    unutrašnjeJedinice: [
      {
        tip: 'odsjek',
        naziv: 'Odsjek',
        obavezna: false,
        minBroj: 2,
        maxBroj: null,
        roditeljTipovi: ['sektor', 'odjeljenje'],
      },
      {
        tip: 'grupa',
        naziv: 'Grupa',
        obavezna: false,
        minBroj: 2,
        maxBroj: null,
        roditeljTipovi: ['sektor', 'odjeljenje'],
      },
    ],
  });
  console.log('✓ Šablon direkcije kreiran');

  console.log('\n✅ Seed globalnih šablona završen!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška pri seed-u:', err);
  process.exit(1);
});
