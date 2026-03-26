// @ts-nocheck
// TODO: Ažurirati na novu shemu RadnoMjesta (pozicijaKljuc, kategorijaZaposlenog, platniRazred, koeficijent)
import * as dotenv from 'dotenv';

import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { OrganizacionaJedinica, RadnoMjesto } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  // Očisti postojeća radna mjesta
  await RadnoMjesto.deleteMany({});
  console.log('Obrisana postojeća radna mjesta');

  // Dohvati sve organizacione jedinice
  const jedinice = await OrganizacionaJedinica.find({}).lean();
  const j = (naziv: string) => {
    const jedinica = jedinice.find((u) => u.naziv === naziv);
    if (!jedinica) throw new Error(`Jedinica nije pronađena: ${naziv}`);
    return jedinica._id;
  };

  // ── Ministarstvo ──────────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Federalni ministar energije, rudarstva i industrije',
      pozicija: 'ministar',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      statusSluzbenika: 'rukovodeci',
      nivo: 1,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Sekretar ministarstva',
      pozicija: 'sekretar',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      statusSluzbenika: 'rukovodeci',
      nivo: 2,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Savjetnik ministra',
      pozicija: 'savjetnik_ministra',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 2,
      brojIzvrsilaca: 3,
    },
  ]);
  console.log('✓ Radna mjesta ministarstva kreirana');

  // ── Kabinet ministra ──────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Šef kabineta',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Kabinet ministra'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj informacionog sistema',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Kabinet ministra'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za odnose s javnošću',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Kabinet ministra'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik — prevodilac',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Kabinet ministra'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent — tehnički sekretar',
      pozicija: 'visi_referent',
      organizacionaJedinica: j('Kabinet ministra'),
      statusSluzbenika: 'namjestenik',
      nivo: 8,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za tehničku dokumentaciju',
      pozicija: 'visi_referent',
      organizacionaJedinica: j('Kabinet ministra'),
      statusSluzbenika: 'namjestenik',
      nivo: 8,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent — vozač',
      pozicija: 'vozac',
      organizacionaJedinica: j('Kabinet ministra'),
      statusSluzbenika: 'namjestenik',
      nivo: 8,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Kabineta kreirana');

  // ── Sektor energije ───────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor energije',
      pozicija: 'pomocnik_ministra',
      organizacionaJedinica: j('Sektor energije'),
      statusSluzbenika: 'rukovodeci',
      nivo: 2,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za elektroenergetiku',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za elektroenergetiku',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za elektroenergetiku',
      pozicija: 'visi_strucni_saradnik',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 6,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za elektroenergetiku',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za tečne energente, plin i termoenergetiku',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za tečne energente, plin i termoenergetiku',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši stručni saradnik za tečne energente, plin i termoenergetiku',
      pozicija: 'visi_strucni_saradnik',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 6,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za tečne energente',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za razvoj',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za razvoj'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj energetike',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za razvoj'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni saradnik za razvoj energetike',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Odsjek za razvoj'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Radna mjesta Sektora energije kreirana');

  // ── Sektor rudarstva ──────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor rudarstva',
      pozicija: 'pomocnik_ministra',
      organizacionaJedinica: j('Sektor rudarstva'),
      statusSluzbenika: 'rukovodeci',
      nivo: 2,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za rudarstvo',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za rudarstvo',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Viši stručni saradnik za rudarstvo',
      pozicija: 'visi_strucni_saradnik',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 6,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni saradnik za rudarstvo',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za geologiju',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za geologiju'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za geologiju',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za geologiju'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Viši stručni saradnik za geologiju',
      pozicija: 'visi_strucni_saradnik',
      organizacionaJedinica: j('Odsjek za geologiju'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 6,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za geologiju',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Odsjek za geologiju'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Radna mjesta Sektora rudarstva kreirana');

  // ── Sektor industrije ─────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor industrije',
      pozicija: 'pomocnik_ministra',
      organizacionaJedinica: j('Sektor industrije'),
      statusSluzbenika: 'rukovodeci',
      nivo: 2,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za metalnu i elektro industriju',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j(
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za metalnu i elektro industriju',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j(
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za tekstilnu industriju',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j(
        'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za tekstilnu industriju',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j(
        'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za analizu i praćenje stanja u privredi',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j(
        'Odsjek za analizu i praćenje stanja u privredi',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za analizu privrede',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j(
        'Odsjek za analizu i praćenje stanja u privredi',
      ),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za razvoj i unapređenje privrede',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj privrede',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Sektora industrije kreirana');

  // ── Sektor za pravne, finansijske i opće poslove ──────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor za pravne, finansijske i opće poslove',
      pozicija: 'pomocnik_ministra',
      organizacionaJedinica: j('Sektor za pravne, finansijske i opće poslove'),
      statusSluzbenika: 'rukovodeci',
      nivo: 2,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za pravne poslove i radne odnose',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši stručni saradnik za pravne poslove',
      pozicija: 'visi_strucni_saradnik',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 6,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za radne odnose',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za finansijsko-računovodstvene poslove',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za finansijske poslove',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši referent za računovodstvo',
      pozicija: 'visi_referent',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      statusSluzbenika: 'namjestenik',
      nivo: 8,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za opće poslove',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za opće poslove',
      pozicija: 'strucni_saradnik',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 7,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši referent za opće poslove',
      pozicija: 'visi_referent',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      statusSluzbenika: 'namjestenik',
      nivo: 8,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef pisarnice',
      pozicija: 'sef_odsjeka',
      organizacionaJedinica: j('Pisarnica'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 3,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent u pisarnici',
      pozicija: 'visi_referent',
      organizacionaJedinica: j('Pisarnica'),
      statusSluzbenika: 'namjestenik',
      nivo: 8,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Referent u pisarnici',
      pozicija: 'referent',
      organizacionaJedinica: j('Pisarnica'),
      statusSluzbenika: 'namjestenik',
      nivo: 9,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Sektora za pravne poslove kreirana');

  // ── Zavod za mjeriteljstvo ────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Direktor Zavoda za mjeriteljstvo',
      pozicija: 'direktor',
      organizacionaJedinica: j('Zavod za mjeriteljstvo'),
      statusSluzbenika: 'rukovodeci',
      nivo: 2,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik u Centru Sarajevo',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Stručni savjetnik u Centru Mostar',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Centar za mjeriteljstvo Mostar'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni savjetnik u Centru Tuzla',
      pozicija: 'strucni_savjetnik',
      organizacionaJedinica: j('Centar za mjeriteljstvo Tuzla'),
      statusSluzbenika: 'drzavni_sluzbenikili',
      nivo: 5,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Zavoda za mjeriteljstvo kreirana');

  // ── FDNI (placeholder) ────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Direktor FDNI',
      pozicija: 'direktor',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      statusSluzbenika: 'rukovodeci',
      nivo: 2,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Pomoćnik direktora FDNI',
      pozicija: 'pomocnik_direktora',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      statusSluzbenika: 'rukovodeci',
      nivo: 3,
      brojIzvrsilaca: 3,
    },
  ]);
  console.log('✓ Radna mjesta FDNI kreirana (placeholder)');

  // Interni revizor — samostalni izvršilac
  await RadnoMjesto.create({
    naziv: 'Stručni savjetnik — interni revizor',
    organizacionaJedinica: j(
      'Federalno ministarstvo energije, rudarstva i industrije',
    ),
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX',
    koeficijent: 4.1,
    opsisPoslova: 'Samostalni izvršilac — interna revizija',
    brojIzvrsilaca: 1,
  });
  console.log('✓ Interni revizor kreiran');

  console.log('\n✅ Seed radnih mjesta završen uspješno!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška pri seed-u:', err);
  process.exit(1);
});
