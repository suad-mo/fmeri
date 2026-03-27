import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { OrganizacionaJedinica, RadnoMjesto } from '@nx-fmeri/api-org';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  await RadnoMjesto.deleteMany({});
  console.log('Obrisana postojeća radna mjesta');

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
      organizacionaJedinica: j('Federalno ministarstvo energije, rudarstva i industrije'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_samostalne_uprave',
      platniRazred: 'II',
      koeficijent: 6.20,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Sekretar ministarstva',
      organizacionaJedinica: j('Federalno ministarstvo energije, rudarstva i industrije'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'sekretar_organa',
      platniRazred: 'II',
      koeficijent: 6.20,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Savjetnik ministra',
      organizacionaJedinica: j('Federalno ministarstvo energije, rudarstva i industrije'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 3,
    },
  ]);
  console.log('✓ Radna mjesta ministarstva kreirana');

  // ── Kabinet ministra ──────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Šef kabineta',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_kabineta_rukovodioca',
      platniRazred: 'VI',
      koeficijent: 4.60,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj informacionog sistema',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za odnose s javnošću',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik — prevodilac',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent — tehnički sekretar',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za tehničku dokumentaciju',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent — vozač',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.70,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Kabineta kreirana');

  // ── Sektor energije ───────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor energije',
      organizacionaJedinica: j('Sektor energije'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši stručni saradnik za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.90,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za tečne energente, plin i termoenergetiku',
      organizacionaJedinica: j('Odsjek za tečne energente, plin i termoenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za tečne energente, plin i termoenergetiku',
      organizacionaJedinica: j('Odsjek za tečne energente, plin i termoenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši stručni saradnik za tečne energente',
      organizacionaJedinica: j('Odsjek za tečne energente, plin i termoenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.90,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za razvoj',
      organizacionaJedinica: j('Odsjek za razvoj'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj energetike',
      organizacionaJedinica: j('Odsjek za razvoj'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Sektora energije kreirana');

  // ── Sektor rudarstva ──────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor rudarstva',
      organizacionaJedinica: j('Sektor rudarstva'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za rudarstvo',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za rudarstvo',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Viši stručni saradnik za rudarstvo',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.90,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za geologiju',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za geologiju',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Viši stručni saradnik za geologiju',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.90,
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Radna mjesta Sektora rudarstva kreirana');

  // ── Sektor industrije ─────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor industrije',
      organizacionaJedinica: j('Sektor industrije'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za metalnu i elektro industriju',
      organizacionaJedinica: j('Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za metalnu i elektro industriju',
      organizacionaJedinica: j('Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za tekstilnu industriju',
      organizacionaJedinica: j('Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za tekstilnu industriju',
      organizacionaJedinica: j('Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za analizu i praćenje stanja u privredi',
      organizacionaJedinica: j('Odsjek za analizu i praćenje stanja u privredi'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za analizu privrede',
      organizacionaJedinica: j('Odsjek za analizu i praćenje stanja u privredi'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za razvoj i unapređenje privrede',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj privrede',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Sektora industrije kreirana');

  // ── Sektor za pravne, finansijske i opće poslove ──────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor za pravne, finansijske i opće poslove',
      organizacionaJedinica: j('Sektor za pravne, finansijske i opće poslove'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.70,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za pravne poslove i radne odnose',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši stručni saradnik za pravne poslove',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.90,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef odsjeka za finansijsko-računovodstvene poslove',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za finansijske poslove',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši referent za računovodstvo',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.70,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef odsjeka za opće poslove',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za opće poslove',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.70,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši referent za opće poslove',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.70,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Šef pisarnice',
      organizacionaJedinica: j('Pisarnica'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.50,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent u pisarnici',
      organizacionaJedinica: j('Pisarnica'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.70,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Referent u pisarnici',
      organizacionaJedinica: j('Pisarnica'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'referent',
      platniRazred: 'VI',
      koeficijent: 2.60,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Sektora za pravne poslove kreirana');

  // ── Zavod za mjeriteljstvo ────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Direktor Zavoda za mjeriteljstvo',
      organizacionaJedinica: j('Zavod za mjeriteljstvo'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_samostalne_uprave',
      platniRazred: 'II',
      koeficijent: 6.20,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik u Centru Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 3,
    },
    {
      naziv: 'Stručni savjetnik u Centru Mostar',
      organizacionaJedinica: j('Centar za mjeriteljstvo Mostar'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni savjetnik u Centru Tuzla',
      organizacionaJedinica: j('Centar za mjeriteljstvo Tuzla'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.10,
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Radna mjesta Zavoda za mjeriteljstvo kreirana');

  // ── FDNI (placeholder) ────────────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Direktor FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_samostalne_uprave',
      platniRazred: 'II',
      koeficijent: 6.20,
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Pomoćnik direktora FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_u_sastavu',
      platniRazred: 'V',
      koeficijent: 4.85,
      brojIzvrsilaca: 3,
    },
  ]);
  console.log('✓ Radna mjesta FDNI kreirana (placeholder)');

  // ── Interni revizor ───────────────────────────────────
  await RadnoMjesto.create({
    naziv: 'Stručni savjetnik — interni revizor',
    organizacionaJedinica: j('Federalno ministarstvo energije, rudarstva i industrije'),
    kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
    pozicijaKljuc: 'strucni_savjetnik',
    platniRazred: 'IX',
    koeficijent: 4.10,
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
