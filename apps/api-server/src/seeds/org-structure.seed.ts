import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { OrganizacionaJedinica } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  await OrganizacionaJedinica.deleteMany({});
  console.log('Obrisane postojeće organizacione jedinice');

  // ── 1. Ministarstvo ───────────────────────────────────
  const ministarstvo = await OrganizacionaJedinica.create({
    naziv: 'Federalno ministarstvo energije, rudarstva i industrije',
    tip: 'ministarstvo',
    nadredjenaJedinica: null,
    opis: 'Federalno ministarstvo energije, rudarstva i industrije',
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

  // ── 3. Sektor energije ────────────────────────────────
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
  console.log('✓ Sektor energije kreiran');

  // ── 4. Sektor rudarstva ───────────────────────────────
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
  console.log('✓ Sektor rudarstva kreiran');

  // ── 5. Sektor industrije ──────────────────────────────
  const sektorIndustrije = await OrganizacionaJedinica.create({
    naziv: 'Sektor industrije',
    tip: 'sektor',
    nadredjenaJedinica: ministarstvo._id,
    redoslijed: 4,
  });
  await OrganizacionaJedinica.insertMany([
    {
      naziv:
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      tip: 'odsjek',
      nadredjenaJedinica: sektorIndustrije._id,
      redoslijed: 1,
    },
    {
      naziv:
        'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
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
  console.log('✓ Sektor industrije kreiran');

  // ── 6. Sektor za pravne, finansijske i opće poslove ───
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
      redoslijed: 4,
    },
  ]);
  console.log('✓ Sektor za pravne poslove kreiran');

  // ── 7. Zavod za mjeriteljstvo ─────────────────────────
  const zavod = await OrganizacionaJedinica.create({
    naziv: 'Zavod za mjeriteljstvo',
    tip: 'zavod',
    nadredjenaJedinica: ministarstvo._id,
    uSastavu: true, // ← dodaj
    opis: 'Federalni zavod za mjeriteljstvo',
    redoslijed: 6,
  });
  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Centar za mjeriteljstvo Mostar',
      tip: 'centar',
      nadredjenaJedinica: zavod._id,
      redoslijed: 1,
    },
    {
      naziv: 'Centar za mjeriteljstvo Sarajevo',
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
  console.log('✓ Zavod za mjeriteljstvo kreiran');

  // ── 8. Federalna direkcija za namjensku industriju ────
  const fdni = await OrganizacionaJedinica.create({
    naziv: 'Federalna direkcija za namjensku industriju',
    tip: 'direkcija',
    nadredjenaJedinica: ministarstvo._id,
    uSastavu: true, // ← dodaj
    opis: 'Federalna direkcija za namjensku industriju',
    redoslijed: 7,
  });

  const sektorProizvodnja = await OrganizacionaJedinica.create({
    naziv: 'Sektor za proizvodnju, remont i kontrolu kvaliteta proizvoda',
    tip: 'sektor',
    nadredjenaJedinica: fdni._id,
    redoslijed: 1,
  });
  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Grupa za proizvodnju i remont',
      tip: 'grupa',
      nadredjenaJedinica: sektorProizvodnja._id,
      redoslijed: 1,
    },
    {
      naziv: 'Grupa za razvoj i kontrolu kvaliteta',
      tip: 'grupa',
      nadredjenaJedinica: sektorProizvodnja._id,
      redoslijed: 2,
    },
  ]);

  const sektorPravniFDNI = await OrganizacionaJedinica.create({
    naziv: 'Sektor za pravne i ekonomske poslove',
    tip: 'sektor',
    nadredjenaJedinica: fdni._id,
    redoslijed: 2,
  });
  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Grupa za pravne poslove',
      tip: 'grupa',
      nadredjenaJedinica: sektorPravniFDNI._id,
      redoslijed: 1,
    },
    {
      naziv: 'Grupa za ekonomske poslove',
      tip: 'grupa',
      nadredjenaJedinica: sektorPravniFDNI._id,
      redoslijed: 2,
    },
  ]);

  const sektorPromet = await OrganizacionaJedinica.create({
    naziv: 'Sektor za promet, marketing i sigurnost',
    tip: 'sektor',
    nadredjenaJedinica: fdni._id,
    redoslijed: 3,
  });
  await OrganizacionaJedinica.insertMany([
    {
      naziv: 'Grupa za promet i marketing',
      tip: 'grupa',
      nadredjenaJedinica: sektorPromet._id,
      redoslijed: 1,
    },
    {
      naziv: 'Grupa za sigurnost',
      tip: 'grupa',
      nadredjenaJedinica: sektorPromet._id,
      redoslijed: 2,
    },
  ]);
  console.log('✓ FDNI i sektori kreirani');

  console.log('\n✅ Seed org. strukture završen!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
