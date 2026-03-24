import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { OrganizacionaJedinica } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  // Očisti postojeće podatke
  await OrganizacionaJedinica.deleteMany({});
  console.log('Obrisane postojeće organizacione jedinice');

  // ── 1. Ministarstvo (root) ────────────────────────────
  const ministarstvo = await OrganizacionaJedinica.create({
    naziv: 'Federalno ministarstvo energije, rudarstva i industrije',
    tip: 'ministarstvo',
    nadredjenaJedinica: null,
    opis: 'Osnovna organizaciona jedinica',
    redoslijed: 1,
  });
  console.log('✓ Ministarstvo kreirano');

  // ── 2. Kabinet ministra ───────────────────────────────
  await OrganizacionaJedinica.create({
    naziv: 'Kabinet ministra',
    tip: 'kabinet',
    nadredjenaJedinica: ministarstvo._id,
    redoslijed: 1,
  });
  console.log('✓ Kabinet ministra kreiran');

  // ── 3. Sektor energije + odsjeci ─────────────────────
  const sektorEnergije = await OrganizacionaJedinica.create({
    naziv: 'Sektor energije',
    tip: 'sektor',
    nadredjenaJedinica: ministarstvo._id,
    redoslijed: 2,
  });

  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Odsjek za elektroenergetiku',
      tip: 'odsjek',
      nadredjenaJedinica: sektorEnergije._id,
      redoslijed: 1,
    },
    {
      naziv: 'Odsjek za tečne energente, plin i termoenergetiku',
      tip: 'odsjek',
      nadredjenaJedinica: sektorEnergije._id,
      redoslijed: 2,
    },
    {
      naziv: 'Odsjek za razvoj',
      tip: 'odsjek',
      nadredjenaJedinica: sektorEnergije._id,
      redoslijed: 3,
    },
  ]);
  console.log('✓ Sektor energije i odsjeci kreirani');

  // ── 4. Sektor rudarstva + odsjeci ────────────────────
  const sektorRudarstva = await OrganizacionaJedinica.create({
    naziv: 'Sektor rudarstva',
    tip: 'sektor',
    nadredjenaJedinica: ministarstvo._id,
    redoslijed: 3,
  });

  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Odsjek za rudarstvo',
      tip: 'odsjek',
      nadredjenaJedinica: sektorRudarstva._id,
      redoslijed: 1,
    },
    {
      naziv: 'Odsjek za geologiju',
      tip: 'odsjek',
      nadredjenaJedinica: sektorRudarstva._id,
      redoslijed: 2,
    },
  ]);
  console.log('✓ Sektor rudarstva i odsjeci kreirani');

  // ── 5. Sektor industrije + odsjeci ───────────────────
  const sektorIndustrije = await OrganizacionaJedinica.create({
    naziv: 'Sektor industrije',
    tip: 'sektor',
    nadredjenaJedinica: ministarstvo._id,
    redoslijed: 4,
  });

  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      tip: 'odsjek',
      nadredjenaJedinica: sektorIndustrije._id,
      redoslijed: 1,
    },
    {
      naziv: 'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      tip: 'odsjek',
      nadredjenaJedinica: sektorIndustrije._id,
      redoslijed: 2,
    },
    {
      naziv: 'Odsjek za analizu i praćenje stanja u privredi',
      tip: 'odsjek',
      nadredjenaJedinica: sektorIndustrije._id,
      redoslijed: 3,
    },
    {
      naziv: 'Odsjek za razvoj i unapređenje privrede',
      tip: 'odsjek',
      nadredjenaJedinica: sektorIndustrije._id,
      redoslijed: 4,
    },
  ]);
  console.log('✓ Sektor industrije i odsjeci kreirani');

  // ── 6. Sektor za pravne, finansijske i opće poslove ──
  const sektorPravni = await OrganizacionaJedinica.create({
    naziv: 'Sektor za pravne, finansijske i opće poslove',
    tip: 'sektor',
    nadredjenaJedinica: ministarstvo._id,
    redoslijed: 5,
  });

  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Odsjek za pravne poslove i radne odnose',
      tip: 'odsjek',
      nadredjenaJedinica: sektorPravni._id,
      redoslijed: 1,
    },
    {
      naziv: 'Odsjek za finansijsko-računovodstvene poslove',
      tip: 'odsjek',
      nadredjenaJedinica: sektorPravni._id,
      redoslijed: 2,
    },
    {
      naziv: 'Odsjek za opće poslove',
      tip: 'odsjek',
      nadredjenaJedinica: sektorPravni._id,
      redoslijed: 3,
    },
    {
      naziv: 'Pisarnica',
      tip: 'odsjek',
      nadredjenaJedinica: sektorPravni._id,
      opis: 'Prijem, obrada i distribucija pošte i dokumenata',
      redoslijed: 4,
    },
  ]);
  console.log('✓ Sektor za pravne poslove i odsjeci kreirani');

  // ── 7. Zavod za mjeriteljstvo + centri ───────────────
  const zavod = await OrganizacionaJedinica.create({
    naziv: 'Zavod za mjeriteljstvo',
    tip: 'upravna_organizacija',
    nadredjenaJedinica: ministarstvo._id,
    opis: 'Federalni zavod za mjeriteljstvo',
    redoslijed: 6,
  });

  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Centar za mjeriteljstvo Sarajevo',
      tip: 'centar',
      nadredjenaJedinica: zavod._id,
      redoslijed: 1,
    },
    {
      naziv: 'Centar za mjeriteljstvo Mostar',
      tip: 'centar',
      nadredjenaJedinica: zavod._id,
      redoslijed: 2,
    },
    {
      naziv: 'Centar za mjeriteljstvo Tuzla',
      tip: 'centar',
      nadredjenaJedinica: zavod._id,
      redoslijed: 3,
    },
  ]);
  console.log('✓ Zavod za mjeriteljstvo i centri kreirani');

  // ── 8. FDNI (placeholder) ─────────────────────────────
  const fdni = await OrganizacionaJedinica.create({
    naziv: 'Federalna direkcija za namjensku industriju',
    tip: 'upravna_organizacija',
    nadredjenaJedinica: ministarstvo._id,
    opis: 'Popuniti detalje naknadno',
    redoslijed: 7,
  });

  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Sektor 1 (FDNI)',
      tip: 'sektor',
      nadredjenaJedinica: fdni._id,
      redoslijed: 1,
    },
    {
      naziv: 'Sektor 2 (FDNI)',
      tip: 'sektor',
      nadredjenaJedinica: fdni._id,
      redoslijed: 2,
    },
    {
      naziv: 'Sektor 3 (FDNI)',
      tip: 'sektor',
      nadredjenaJedinica: fdni._id,
      redoslijed: 3,
    },
  ]);
  console.log('✓ FDNI i sektori kreirani (placeholder)');

  console.log('\n✅ Seed završen uspješno!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška pri seed-u:', err);
  process.exit(1);
});
