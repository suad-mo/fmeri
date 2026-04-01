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
    if (!jedinica) throw new Error(`Jedinica nije pronađena: "${naziv}"`);
    return jedinica._id;
  };

  // ════════════════════════════════════════════════════════
  // I. FEDERALNO MINISTARSTVO ENERGIJE, RUDARSTVA I INDUSTRIJE
  // Ukupno: 86 izvršilaca (bez ministra) + 3 savjetnika ministra
  // ════════════════════════════════════════════════════════

  // ── Ministarstvo — rukovodeći ─────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Federalni ministar energije, rudarstva i industrije',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      kategorijaZaposlenog: 'izabrani_duznosnik',
      pozicijaKljuc: 'ministar',
      platniRazred: 'IV', // Član 9. Zakon o plaćama — ministri koeficijent 9.00
      koeficijent: 9.0,
      opsisPoslova: 'Rukovodi Ministarstvom, odgovoran Vladi Federacije.',
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Sekretar Ministarstva',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'sekretar_organa',
      platniRazred: 'II',
      koeficijent: 6.2,
      opsisPoslova:
        'Obavlja poslove od značaja za unutrašnju organizaciju i rad Ministarstva, koordinira radom sektora i organizacionih jedinica.',
      posebniUvjeti: [
        'VSS - VII stepen ili Bologna, pravna ili ekonomska struka',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Savjetnik ministra za energiju',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Pruža stručnu podršku ministru u oblasti energetike.',
      posebniUvjeti: [
        'VSS - VII stepen ili Bologna, tehnički fakultet',
        'Min. 3 godine radnog staža',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Savjetnik ministra za rudarstvo',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Pruža stručnu podršku ministru u oblasti rudarstva.',
      posebniUvjeti: [
        'VSS - VII stepen ili Bologna, rudarsko-geološki ili tehnički fakultet',
        'Min. 3 godine radnog staža',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Savjetnik ministra za industriju',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Pruža stručnu podršku ministru u oblasti industrije.',
      posebniUvjeti: [
        'VSS - VII stepen ili Bologna, tehnički ili ekonomski fakultet',
        'Min. 3 godine radnog staža',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik — interni revizor',
      organizacionaJedinica: j(
        'Federalno ministarstvo energije, rudarstva i industrije',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši poslove interne revizije u skladu sa Zakonom o Budžetu i međunarodnim standardima za internu reviziju.',
      posebniUvjeti: [
        'VSS - VII stepen ili Bologna, ekonomski ili pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen ispit za internog revizora',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Ministarstvo — rukovodeći i samostalni izvršioci');

  // ── Kabinet ministra (Član 19.) ───────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Šef Kabineta',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
      platniRazred: 'VI',
      koeficijent: 4.6,
      opsisPoslova:
        'Rukovodi Kabinetom, organizuje protokolarne i administrativne poslove ministra, priprema sjednice Stručnog kolegija.',
      posebniUvjeti: [
        'VSS - pravna/upravna struka ili filozofski fakultet - engleski jezik',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj informacionog sistema',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši izradu informacionih programa, poslove analize, projektovanja i implementacije informacionog sistema Ministarstva.',
      posebniUvjeti: [
        'VSS - fakultet informacijskih tehnologija, elektrotehnički ili mašinski',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za komunikaciju',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Prikuplja i obrađuje podatke u vezi odnosa s javnošću, priprema materijale za Web stranicu, planira kontakte s javnošću.',
      posebniUvjeti: [
        'VSS - pravna/upravna struka, filozofski/politički fakultet - odnosi s javnošću ili žurnalistika',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik - prevodilac',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Vrši prijevod tekstova sa službenih jezika na engleski i obratno, vrši simultano prevođenje.',
      posebniUvjeti: [
        'VSS - filozofski fakultet ili fakultet humanističkih nauka - engleski jezik',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent - tehnički sekretar',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši administrativno-tehničke poslove u vezi prijema i distribucije prepiske, rukuje telefaks aparatom i uređajem za kopiranje.',
      posebniUvjeti: [
        'SSS - ekonomska, upravna, mašinska ili gimnazija',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
        'Poznavanje rada na računaru',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši referent za tehničku dokumentaciju',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši prikupljanje, sređivanje i tehničku obradu materijala, vodi evidenciju o dokumentaciji i ažurira bazu podataka.',
      posebniUvjeti: [
        'SSS - birotehnička, gimnazija, ekonomska, mašinsko-tehnička ili upravna',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
        'Poznavanje rada na računaru',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Vozač',
      organizacionaJedinica: j('Kabinet ministra'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'pomocni_radnik',
      platniRazred: 'VII',
      koeficijent: 1.85,
      opsisPoslova:
        'Upravlja putničkim vozilom prema službenom nalogu, stara se o redovnom održavanju i tehničkoj ispravnosti vozila.',
      posebniUvjeti: [
        'SSS - saobraćajna ili tehnička škola',
        'VKV vozač motornih vozila "B" kategorije',
        'Min. 10 mjeseci radnog staža',
      ],
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Kabinet ministra (7 radnih mjesta, 9 izvršilaca)');

  // ── Sektor energije (Član 20.) ────────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor energije',
      organizacionaJedinica: j('Sektor energije'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.7,
      opsisPoslova:
        'Rukovodi Sektorom energije, odgovoran za praćenje i provođenje zakona u oblasti energije.',
      posebniUvjeti: [
        'VSS - tehnički ili pravni fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za elektroenergetiku
    {
      naziv: 'Šef odsjeka za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira kreiranje elektroenergetske politike i nadzire realizaciju bilansa elektroenergetskih potreba.',
      posebniUvjeti: [
        'VSS - elektrotehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Učestvuje u izradi zakona i pratećih akata, kreiranje elektroenergetske politike i razvoj alternativnih izvora energije.',
      posebniUvjeti: [
        'VSS - elektrotehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove - elektroenergetika',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Izrađuje prednacrte i nacrte zakona, vodi upravni postupak i rješava u upravnim stvarima u oblasti elektroenergetike.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Prati sveukupno poslovanje privrednih subjekata u oblasti elektroenergetike i obrađuje prikupljene podatke.',
      posebniUvjeti: [
        'VSS - elektrotehnički fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za elektroenergetiku',
      organizacionaJedinica: j('Odsjek za elektroenergetiku'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Vrši stručnu obradu sistemskih rješenja od značaja za oblast elektroenergetike i izrađuje analitičke materijale.',
      posebniUvjeti: [
        'VSS - elektrotehnički fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za tečne energente, plin i termoenergetiku
    {
      naziv: 'Šef odsjeka za tečne energente, plin i termoenergetiku',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira definisanje potreba i osiguranje naftnih derivata i prirodnog plina.',
      posebniUvjeti: [
        'VSS - mašinski, hemijsko-tehnološki ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za tečne energente, plin i termoenergetiku',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati sveukupno poslovanje privrednih društava, kreiranje energetske politike u oblasti tečnih energenata i plina.',
      posebniUvjeti: [
        'VSS - mašinski ili hemijsko-tehnološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za tečne energente, plin i termoenergetiku',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Izrađuje materijale za informiranje nadležnih organa o stanju u oblasti tečnih energenata.',
      posebniUvjeti: [
        'VSS - mašinski ili hemijsko-tehnološki fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za tečne energente, plin i termoenergetiku',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Vrši stručnu obradu sistemskih rješenja u oblasti tečnih energenata, plina i termoenergetike.',
      posebniUvjeti: [
        'VSS - mašinski ili hemijsko-tehnološki fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za tehničku dokumentaciju - energija',
      organizacionaJedinica: j(
        'Odsjek za tečne energente, plin i termoenergetiku',
      ),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši prikupljanje, sređivanje i tehničku obradu materijala u oblasti tečnih energenata.',
      posebniUvjeti: [
        'SSS - tehnička ili birotehnička škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
        'Poznavanje rada na računaru',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za razvoj
    {
      naziv: 'Šef odsjeka za razvoj',
      organizacionaJedinica: j('Odsjek za razvoj'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira monitoring tekućih energetskih projekata i pripremu osnovnih informacija za investitore.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za energetske objekte',
      organizacionaJedinica: j('Odsjek za razvoj'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Učestvuje u pripremi i izradi studija i projekata izgradnje i rekonstrukcije energetskih objekata.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za energetski bilans i pokazatelje',
      organizacionaJedinica: j('Odsjek za razvoj'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Priprema programe istraživanja u oblasti energije, učestvuje u izradi i praćenju energetskih bilansa.',
      posebniUvjeti: [
        'VSS - tehnički ili ekonomski fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za energetski bilans i pokazatelje',
      organizacionaJedinica: j('Odsjek za razvoj'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Učestvuje u pripremi, izradi i praćenju redovnih i periodičnih energetskih bilansa.',
      posebniUvjeti: [
        'VSS - tehnički ili ekonomski fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za vođenje tehničke dokumentacije - razvoj',
      organizacionaJedinica: j('Odsjek za razvoj'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši vođenje i ažuriranje tehničke dokumentacije za projekte u oblasti energetskog razvoja.',
      posebniUvjeti: [
        'SSS - birotehnička ili tehnička škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Sektor energije (16 radnih mjesta, 16 izvršilaca)');

  // ── Sektor rudarstva (Član 21.) ───────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor rudarstva',
      organizacionaJedinica: j('Sektor rudarstva'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.7,
      opsisPoslova:
        'Rukovodi Sektorom rudarstva, odgovoran za izradu prednacrta zakona i provođenje politike u oblasti rudarstva i geologije.',
      posebniUvjeti: [
        'VSS - rudarsko-geološki ili tehnički fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za rudarstvo
    {
      naziv: 'Šef odsjeka za rudarstvo',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira poslove u oblasti podzemne i površinske eksploatacije mineralnih sirovina.',
      posebniUvjeti: [
        'VSS - rudarski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za podzemnu i površinsku eksploataciju ugljena',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati razvoj i modernizaciju rudnika uglja, koordinira aktivnosti u oblasti prestrukturiranja.',
      posebniUvjeti: [
        'VSS - rudarski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za metalične mineralne sirovine',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati stanje i razvoj eksploatacije metaličnih mineralnih sirovina.',
      posebniUvjeti: [
        'VSS - rudarski ili geološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za prestrukturiranje rudnika uglja',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Koordinira realizaciju Akcionog plana prestrukturiranja i modernizacije rudnika ugljena.',
      posebniUvjeti: [
        'VSS - rudarski ili ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove - rudarstvo',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Daje stručna mišljenja, izrađuje prijedloge zakona i propisa u oblasti rudarstva.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši samostalni referent za administrativne poslove - rudarstvo',
      organizacionaJedinica: j('Odsjek za rudarstvo'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_samostalni_referent',
      platniRazred: 'II',
      koeficijent: 3.1,
      opsisPoslova:
        'Vrši informaciono-dokumentacione i administrativne poslove u Sektoru rudarstva.',
      posebniUvjeti: [
        'VŠS - ekonomska ili upravna struka',
        'Min. 1 godina radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za geologiju
    {
      naziv: 'Šef odsjeka za geologiju',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira poslove u oblasti geoloških istraživanja.',
      posebniUvjeti: [
        'VSS - geološki ili rudarski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za osnovna geološka istraživanja',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati i koordinira poslove osnove geološke istraživanja mineralnih sirovina.',
      posebniUvjeti: [
        'VSS - geološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za detaljna geološka istraživanja',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati i koordinira poslove detaljnih geoloških istraživanja.',
      posebniUvjeti: [
        'VSS - geološki ili rudarski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv:
        'Viši stručni saradnik za katastar istražnih prostora i eksploatacionih polja',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Vrši vođenje i ažuriranje katastra istražnih prostora i eksploatacionih polja mineralnih sirovina.',
      posebniUvjeti: [
        'VSS - geološki ili rudarski fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za izradu bilansa rezervi mineralnih sirovina',
      organizacionaJedinica: j('Odsjek za geologiju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Učestvuje u izradi bilansa rezervi mineralnih sirovina i praćenju geološke dokumentacije.',
      posebniUvjeti: [
        'VSS - geološki ili rudarski fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Sektor rudarstva (13 radnih mjesta, 13 izvršilaca)');

  // ── Sektor industrije (Član 22.) ──────────────────────
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor industrije',
      organizacionaJedinica: j('Sektor industrije'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.7,
      opsisPoslova:
        'Rukovodi Sektorom industrije, odgovoran za praćenje privređivanja i koordinaciju industrijskog razvoja.',
      posebniUvjeti: [
        'VSS - tehnički ili ekonomski fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za metalnu i elektro industriju
    {
      naziv: 'Šef odsjeka za metalnu i elektro industriju',
      organizacionaJedinica: j(
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira praćenje i analizu stanja u metalnoj, elektro industriji i industrijama prerade drveta.',
      posebniUvjeti: [
        'VSS - mašinski, elektrotehnički ili tehnološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za metalnu industriju',
      organizacionaJedinica: j(
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati i analizira stanje u metalnoj industriji, priprema prijedloge mjera za unapređenje.',
      posebniUvjeti: [
        'VSS - mašinski ili metalurški fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv:
        'Stručni savjetnik za industriju građevinskog materijala i nemetale',
      organizacionaJedinica: j(
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Prati industriju građevinskog materijala i nemetala.',
      posebniUvjeti: [
        'VSS - građevinski ili tehnološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv:
        'Stručni savjetnik za industriju prerade drveta i grafičku djelatnost',
      organizacionaJedinica: j(
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati i analizira stanje u industriji prerade drveta i grafičkoj djelatnosti.',
      posebniUvjeti: [
        'VSS - šumarski ili tehnološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za elektroindustriju',
      organizacionaJedinica: j(
        'Odsjek za metalnu i elektro industriju, industriju prerade drveta, industriju građevinskog materijala i nemetala i grafičku djelatnost',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Prati i analizira stanje u elektroindustriji.',
      posebniUvjeti: [
        'VSS - elektrotehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za tekstilnu industriju
    {
      naziv:
        'Šef odsjeka za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      organizacionaJedinica: j(
        'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira praćenje i analizu tekstilne, kožarske, hemijske i farmaceutske industrije.',
      posebniUvjeti: [
        'VSS - tehnološki ili hemijsko-tehnološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za tekstilnu, kožarsku i obućarsku industriju',
      organizacionaJedinica: j(
        'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Prati i analizira stanje u tekstilnoj, kožarskoj i obućarskoj industriji.',
      posebniUvjeti: [
        'VSS - tehnološki ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni savjetnik za farmaceutsku industriju',
      organizacionaJedinica: j(
        'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Prati i analizira stanje u farmaceutskoj industriji.',
      posebniUvjeti: [
        'VSS - farmaceutski ili hemijsko-tehnološki fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za hemijsku industriju',
      organizacionaJedinica: j(
        'Odsjek za tekstilnu, kožarsku, obućarsku, hemijsku i farmaceutsku industriju',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova: 'Prati i analizira stanje u hemijskoj industriji.',
      posebniUvjeti: [
        'VSS - hemijsko-tehnološki fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za analizu i praćenje stanja u privredi
    {
      naziv: 'Šef odsjeka za analizu i praćenje stanja u privredi',
      organizacionaJedinica: j(
        'Odsjek za analizu i praćenje stanja u privredi',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira analizu i praćenje stanja u privredi.',
      posebniUvjeti: [
        'VSS - ekonomski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za analizu i praćenje stanja u privredi',
      organizacionaJedinica: j(
        'Odsjek za analizu i praćenje stanja u privredi',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši analizu i praćenje stanja u privredi, priprema izvještaje i informacije.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove - industrija',
      organizacionaJedinica: j(
        'Odsjek za analizu i praćenje stanja u privredi',
      ),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Priprema pravna mišljenja i propise u oblasti industrijskog razvoja.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za tehničku dokumentaciju - industrija',
      organizacionaJedinica: j(
        'Odsjek za analizu i praćenje stanja u privredi',
      ),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši tehničku obradu i vodi dokumentaciju sektora industrije.',
      posebniUvjeti: [
        'SSS - birotehnička ili ekonomska škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za razvoj i unapređenje privrede
    {
      naziv: 'Šef odsjeka za razvoj i unapređenje privrede',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira pripremu i praćenje projekata razvoja privrede.',
      posebniUvjeti: [
        'VSS - ekonomski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj privrede',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Priprema projekte i prijedloge mjera za razvoj i unapređenje privrednih subjekata.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za razvoj privrede',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Učestvuje u pripremi analiza i izvještaja o razvoju privrednih subjekata.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za unapređenje privrede',
      organizacionaJedinica: j('Odsjek za razvoj i unapređenje privrede'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Prikuplja i obrađuje podatke o privrednim subjektima, učestvuje u pripremi programa unapređenja.',
      posebniUvjeti: [
        'VSS - ekonomski ili tehnički fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Sektor industrije (19 radnih mjesta, 21 izvršilac)');

  // ── Sektor za pravne, finansijske i opće poslove (Član 23.) ──
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik ministra — Sektor za pravne, finansijske i opće poslove',
      organizacionaJedinica: j('Sektor za pravne, finansijske i opće poslove'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_rukovodioca',
      platniRazred: 'III',
      koeficijent: 5.7,
      opsisPoslova:
        'Rukovodi sektorom, odgovoran za normativno-pravne, finansijske i opće poslove Ministarstva.',
      posebniUvjeti: [
        'VSS - pravni ili ekonomski fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za pravne poslove i radne odnose
    {
      naziv: 'Šef odsjeka za pravne poslove i radne odnose',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira normativno-pravne poslove i radne odnose.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Izrađuje prednacrte i nacrte propisa, daje pravna mišljenja i rješava u upravnim stvarima.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni savjetnik za normativno-pravne poslove',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši normativno-pravnu obradu propisa, priprema nacrte zakona i podzakonskih akata.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni savjetnik za radne odnose',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši poslove u oblasti radnih odnosa, rješava zahtjeve i žalbe državnih službenika i namještenika.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Stručni saradnik - lektor',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Vrši lekturu i korekturu svih akata i dokumenata Ministarstva.',
      posebniUvjeti: [
        'VSS - filozofski fakultet - jezik i književnost',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši samostalni referent za kadrovske i administrativne poslove',
      organizacionaJedinica: j('Odsjek za pravne poslove i radne odnose'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_samostalni_referent',
      platniRazred: 'II',
      koeficijent: 3.1,
      opsisPoslova:
        'Vrši kadrovske i administrativne poslove, vodi evidenciju o zaposlenima.',
      posebniUvjeti: [
        'VŠS - ekonomska ili upravna struka',
        'Min. 1 godina radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za finansijsko-računovodstvene poslove
    {
      naziv: 'Šef odsjeka za finansijsko-računovodstvene poslove',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira finansijsko-računovodstvene poslove Ministarstva.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za ekonomsko-finansijske poslove',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši finansijsko-računovodstvene poslove, priprema finansijske izvještaje i analize.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za ekonomsko-finansijske poslove',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Vrši poslove u oblasti finansijskog planiranja i izvještavanja.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši referent - blagajnik',
      organizacionaJedinica: j('Odsjek za finansijsko-računovodstvene poslove'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši blagajničke poslove, evidenciju gotovinskih uplata i isplata.',
      posebniUvjeti: [
        'SSS - ekonomska škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    // Odsjek za opće poslove
    {
      naziv: 'Šef odsjeka za opće poslove',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi odsjekom, koordinira opće i logističke poslove Ministarstva.',
      posebniUvjeti: [
        'VSS - pravni ili ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Samostalni referent za opće poslove',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'samostalni_referent',
      platniRazred: 'III',
      koeficijent: 3.0,
      opsisPoslova:
        'Vrši opće administrativne i logističke poslove za potrebe Ministarstva.',
      posebniUvjeti: [
        'VŠS - ekonomska ili upravna struka',
        'Min. 1 godina radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Kafe kuharica',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'pomocni_radnik',
      platniRazred: 'VII',
      koeficijent: 1.85,
      opsisPoslova: 'Priprema napitke za potrebe Ministarstva.',
      posebniUvjeti: ['SSS', 'Min. 10 mjeseci radnog staža'],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Spremačica',
      organizacionaJedinica: j('Odsjek za opće poslove'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'pomocni_radnik',
      platniRazred: 'VII',
      koeficijent: 1.85,
      opsisPoslova:
        'Vrši poslove čišćenja i održavanja prostorija Ministarstva.',
      posebniUvjeti: ['SSS ili NK', 'Min. 10 mjeseci radnog staža'],
      brojIzvrsilaca: 2,
    },
    // Pisarnica
    {
      naziv: 'Šef pisarnice',
      organizacionaJedinica: j('Pisarnica'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice_sss',
      platniRazred: 'IV',
      koeficijent: 2.8,
      opsisPoslova:
        'Rukovodi pisarnicom, organizuje prijem, evidentiranje i distribuciju pošte.',
      posebniUvjeti: [
        'SSS - birotehnička, upravna ili ekonomska škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za kancelarijsko poslovanje',
      organizacionaJedinica: j('Pisarnica'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši prijem, evidentiranje, raspoređivanje i ekspediciju pošte i prati kretanje akata.',
      posebniUvjeti: [
        'SSS - birotehnička ili upravna škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 2,
    },
    {
      naziv: 'Viši referent za arhivske poslove',
      organizacionaJedinica: j('Pisarnica'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši arhiviranje dokumenata i evidenciju arhivske građe Ministarstva.',
      posebniUvjeti: [
        'SSS - birotehnička ili upravna škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Sektor za pravne poslove (18 radnih mjesta, 25 izvršilaca)');

  // ════════════════════════════════════════════════════════
  // II. ZAVOD ZA MJERITELJSTVO
  // Ukupno: 24 izvršioca
  // ════════════════════════════════════════════════════════

  await RadnoMjesto.insertMany([
    {
      naziv: 'Direktor Zavoda za mjeriteljstvo',
      organizacionaJedinica: j('Zavod za mjeriteljstvo'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_samostalne_uprave',
      platniRazred: 'II',
      koeficijent: 6.2,
      opsisPoslova:
        'Rukovodi Zavodom, odgovoran za obavljanje svih poslova iz nadležnosti Zavoda.',
      posebniUvjeti: [
        'VSS - tehnički, pravni ili ekonomski fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);

  // Centar za verifikaciju i nadzor mjerila - Mostar (Član 57.)
  await RadnoMjesto.insertMany([
    {
      naziv: 'Načelnik Centra - Mostar',
      organizacionaJedinica: j('Centar za mjeriteljstvo Mostar'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
      platniRazred: 'VI',
      koeficijent: 4.6,
      opsisPoslova:
        'Rukovodi Centrom, koordinira poslove verifikacije i nadzora mjerila u regiji Mostar.',
      posebniUvjeti: [
        'VSS - tehnički fakultet - mjeriteljstvo ili fizika',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za mjeriteljstvo - Mostar',
      organizacionaJedinica: j('Centar za mjeriteljstvo Mostar'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši stručne poslove verifikacije mjerila, izdaje rješenja i provodi upravni postupak.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za plemenite metale - Mostar',
      organizacionaJedinica: j('Centar za mjeriteljstvo Mostar'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Vrši žigosanje i kontrolu plemenitih metala.',
      posebniUvjeti: [
        'VSS - tehnički ili hemijski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za mjeriteljstvo - Mostar',
      organizacionaJedinica: j('Centar za mjeriteljstvo Mostar'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Učestvuje u verifikaciji mjerila i izradi pratećih dokumenata.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za mjeriteljstvo i plemenite metale - Mostar',
      organizacionaJedinica: j('Centar za mjeriteljstvo Mostar'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši administrativno-tehničke poslove u oblasti mjeriteljstva i plemenitih metala.',
      posebniUvjeti: [
        'SSS - tehnička škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Zavod - Centar Mostar (5 radnih mjesta, 5 izvršilaca)');

  // Centar za verifikaciju i nadzor mjerila - Sarajevo (Član 58.)
  await RadnoMjesto.insertMany([
    {
      naziv: 'Načelnik Centra - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
      platniRazred: 'VI',
      koeficijent: 4.6,
      opsisPoslova:
        'Rukovodi Centrom, koordinira poslove verifikacije i nadzora mjerila u regiji Sarajevo.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za mjeriteljstvo - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Vrši stručne poslove verifikacije mjerila.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za plemenite metale - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Vrši žigosanje i kontrolu plemenitih metala.',
      posebniUvjeti: [
        'VSS - hemijski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za mjeriteljstvo - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova: 'Učestvuje u verifikaciji mjerila.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za plemenite metale - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova: 'Učestvuje u kontroli plemenitih metala.',
      posebniUvjeti: [
        'VSS - hemijski ili tehnički fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za mjeriteljstvo - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova: 'Vrši poslove verifikacije mjerila.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za plemenite metale - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova: 'Vrši poslove kontrole plemenitih metala.',
      posebniUvjeti: [
        'VSS - hemijski ili tehnički fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za mjeriteljstvo i plemenite metale - Sarajevo',
      organizacionaJedinica: j('Centar za mjeriteljstvo Sarajevo'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši administrativno-tehničke poslove u oblasti mjeriteljstva.',
      posebniUvjeti: [
        'SSS - tehnička škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 2,
    },
  ]);
  console.log('✓ Zavod - Centar Sarajevo (8 radnih mjesta, 9 izvršilaca)');

  // Centar za verifikaciju i nadzor mjerila - Tuzla (Član 59.)
  await RadnoMjesto.insertMany([
    {
      naziv: 'Načelnik Centra - Tuzla',
      organizacionaJedinica: j('Centar za mjeriteljstvo Tuzla'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
      platniRazred: 'VI',
      koeficijent: 4.6,
      opsisPoslova:
        'Rukovodi Centrom, koordinira poslove verifikacije i nadzora mjerila u regiji Tuzla.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za plemenite metale - Tuzla',
      organizacionaJedinica: j('Centar za mjeriteljstvo Tuzla'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši žigosanje i kontrolu plemenitih metala u regiji Tuzla.',
      posebniUvjeti: [
        'VSS - hemijski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za mjeriteljstvo - Tuzla',
      organizacionaJedinica: j('Centar za mjeriteljstvo Tuzla'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova: 'Učestvuje u verifikaciji mjerila u regiji Tuzla.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za mjeriteljstvo - Tuzla',
      organizacionaJedinica: j('Centar za mjeriteljstvo Tuzla'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova: 'Vrši poslove verifikacije mjerila u regiji Tuzla.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za mjeriteljstvo i plemenite metale - Tuzla',
      organizacionaJedinica: j('Centar za mjeriteljstvo Tuzla'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši administrativno-tehničke poslove u oblasti mjeriteljstva u Tuzli.',
      posebniUvjeti: [
        'SSS - tehnička škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Zavod - Centar Tuzla (5 radnih mjesta, 5 izvršilaca)');

  // Služba za opće poslove Zavoda (Član 60.)
  await RadnoMjesto.insertMany([
    {
      naziv: 'Načelnik Službe za opće poslove - Zavod',
      organizacionaJedinica: j('Zavod za mjeriteljstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_osnovne_jedinice',
      platniRazred: 'VI',
      koeficijent: 4.6,
      opsisPoslova:
        'Rukovodi Službom za opće poslove, koordinira administrativne i finansijske poslove Zavoda.',
      posebniUvjeti: [
        'VSS - pravni ili ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove - Zavod',
      organizacionaJedinica: j('Zavod za mjeriteljstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Vrši pravne poslove Zavoda, priprema propise i rješenja.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za ekonomske poslove - Zavod',
      organizacionaJedinica: j('Zavod za mjeriteljstvo'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova: 'Vrši finansijsko-računovodstvene poslove Zavoda.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za opće poslove - Zavod',
      organizacionaJedinica: j('Zavod za mjeriteljstvo'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova: 'Vrši administrativno-tehničke i opće poslove Zavoda.',
      posebniUvjeti: [
        'SSS - birotehnička ili ekonomska škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log('✓ Zavod - Služba za opće poslove (4 radna mjesta, 4 izvršioca)');

  // ════════════════════════════════════════════════════════
  // III. FEDERALNA DIREKCIJA ZA NAMJENSKU INDUSTRIJU
  // Ukupno: 28 izvršilaca
  // ════════════════════════════════════════════════════════

  await RadnoMjesto.insertMany([
    {
      naziv: 'Direktor Federalne direkcije za namjensku industriju',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'rukovodilac_samostalne_uprave',
      platniRazred: 'II',
      koeficijent: 6.2,
      opsisPoslova:
        'Rukovodi Direkcijom, odgovoran za sve poslove iz nadležnosti namjenske industrije.',
      posebniUvjeti: [
        'VSS - tehnički, pravni ili ekonomski fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);

  // Sektor za proizvodnju, remont i kontrolu kvaliteta (Član 74.)
  await RadnoMjesto.insertMany([
    {
      naziv:
        'Pomoćnik direktora — Sektor za proizvodnju, remont i kontrolu kvaliteta',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_u_sastavu',
      platniRazred: 'V',
      koeficijent: 4.85,
      opsisPoslova:
        'Rukovodi Sektorom, koordinira planiranje i nadzor proizvodnje i remonta NVO.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef Grupe za proizvodnju i remont',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi Grupom, koordinira izradu planova razvoja, proizvodnje i remonta NVO.',
      posebniUvjeti: [
        'VSS - mašinski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za planiranje proizvodnje NVO',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši izradu dugoročnih i kratkoročnih planova proizvodnje NVO.',
      posebniUvjeti: [
        'VSS - mašinski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za remont NVO',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova: 'Koordinira aktivnosti remonta NVO i tržišnih proizvoda.',
      posebniUvjeti: [
        'VSS - mašinski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za proizvodnju i remont',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova:
        'Učestvuje u praćenju realizacije planova proizvodnje i remonta NVO.',
      posebniUvjeti: [
        'VSS - mašinski ili tehnički fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef Grupe za razvoj i kontrolu kvaliteta proizvoda',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi Grupom, koordinira planiranje i nadzor razvoja i kontrole kvaliteta NVO.',
      posebniUvjeti: [
        'VSS - mašinski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za razvoj i kvalitet NVO',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Koordinira razvoj i kontrolu kvaliteta NVO i tržišnih proizvoda.',
      posebniUvjeti: [
        'VSS - mašinski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za razvoj i kontrolu kvaliteta',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova: 'Učestvuje u realizaciji planova razvoja i kvaliteta.',
      posebniUvjeti: [
        'VSS - mašinski ili tehnički fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za administrativne poslove - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši administrativno-tehničke poslove za Sektor za proizvodnju.',
      posebniUvjeti: [
        'SSS - birotehnička ili ekonomska škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log(
    '✓ FDNI - Sektor za proizvodnju, remont i kontrolu kvaliteta (9 radnih mjesta, 9 izvršilaca)',
  );

  // Sektor za pravne i ekonomske poslove (Član 75.)
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik direktora — Sektor za pravne i ekonomske poslove',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_u_sastavu',
      platniRazred: 'V',
      koeficijent: 4.85,
      opsisPoslova:
        'Rukovodi Sektorom, koordinira pravne i ekonomske poslove Direkcije.',
      posebniUvjeti: [
        'VSS - pravni ili ekonomski fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef Grupe za pravne poslove',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi Grupom, koordinira izradu pravnih analiza i propisa u oblasti namjenske industrije.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za pravne poslove - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši normativno-pravne poslove, izrađuje prijedloge zakona i propisa u oblasti namjenske industrije.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za pravne poslove - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Vrši normativno-pravne poslove u oblasti namjenske industrije.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za pravne poslove - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova: 'Učestvuje u pripremi pravnih akata i mišljenja.',
      posebniUvjeti: [
        'VSS - pravni fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef Grupe za ekonomske poslove',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi Grupom, koordinira finansijsko planiranje i ekonomske poslove Direkcije.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za ekonomske poslove - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši izradu dugoročnih i kratkoročnih finansijskih planova namjenske industrije.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni saradnik za ekonomske poslove - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_saradnik',
      platniRazred: 'XI',
      koeficijent: 3.7,
      opsisPoslova: 'Učestvuje u pripremi finansijskih planova i izvještaja.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 1 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za ekonomsko-finansijske poslove - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši administrativno-tehničke poslove za ekonomski sektor.',
      posebniUvjeti: [
        'SSS - ekonomska škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log(
    '✓ FDNI - Sektor za pravne i ekonomske poslove (9 radnih mjesta, 9 izvršilaca)',
  );

  // Sektor za promet, marketing i sigurnost (Član 76.)
  await RadnoMjesto.insertMany([
    {
      naziv: 'Pomoćnik direktora — Sektor za promet, marketing i sigurnost',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'rukovodeci_drzavni_sluzbenik',
      pozicijaKljuc: 'pomocnik_u_sastavu',
      platniRazred: 'V',
      koeficijent: 4.85,
      opsisPoslova:
        'Rukovodi Sektorom, koordinira marketing, promet i sigurnost u oblasti namjenske industrije.',
      posebniUvjeti: [
        'VSS - tehnički, pravni ili ekonomski fakultet',
        'Min. 5 godina radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef Grupe za promet i marketing',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi Grupom, koordinira planiranje nastupa na domaćem i ino tržištu.',
      posebniUvjeti: [
        'VSS - ekonomski ili tehnički fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za promet i marketing',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Vrši izradu planova marketinga, koordinira izvoz i uvoz NVO.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za promet i marketing',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova:
        'Učestvuje u pripremi planova nastupa na tržištu i kontroli izvoza NVO.',
      posebniUvjeti: [
        'VSS - ekonomski fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši referent za promet - FDNI',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'namjestenik',
      pozicijaKljuc: 'visi_referent',
      platniRazred: 'V',
      koeficijent: 2.7,
      opsisPoslova:
        'Vrši administrativno-tehničke poslove za promet i marketing.',
      posebniUvjeti: [
        'SSS - ekonomska ili birotehnička škola',
        'Min. 10 mjeseci radnog staža',
        'Položen stručni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Šef Grupe za sigurnost',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'sef_unutrasnje_jedinice',
      platniRazred: 'VII',
      koeficijent: 4.5,
      opsisPoslova:
        'Rukovodi Grupom, koordinira planiranje i nadzor sigurnosti pri proizvodnji NVO.',
      posebniUvjeti: [
        'VSS - tehnički ili pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Stručni savjetnik za sigurnost NVO',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'strucni_savjetnik',
      platniRazred: 'IX',
      koeficijent: 4.1,
      opsisPoslova:
        'Koordinira aktivnosti na sigurnosti i zaštiti pri proizvodnji i remontu NVO.',
      posebniUvjeti: [
        'VSS - tehnički ili pravni fakultet',
        'Min. 3 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
    {
      naziv: 'Viši stručni saradnik za sigurnost',
      organizacionaJedinica: j('Federalna direkcija za namjensku industriju'),
      kategorijaZaposlenog: 'ostali_drzavni_sluzbenik',
      pozicijaKljuc: 'visi_strucni_saradnik',
      platniRazred: 'X',
      koeficijent: 3.9,
      opsisPoslova: 'Učestvuje u izradi planova sigurnosti i zaštite.',
      posebniUvjeti: [
        'VSS - tehnički fakultet',
        'Min. 2 godine radnog staža',
        'Položen stručni upravni ispit',
      ],
      brojIzvrsilaca: 1,
    },
  ]);
  console.log(
    '✓ FDNI - Sektor za promet, marketing i sigurnost (8 radnih mjesta, 8 izvršilaca)',
  );

  const ukupno = await RadnoMjesto.countDocuments();
  console.log(`\n✅ Seed završen! Ukupno kreirano: ${ukupno} radnih mjesta`);
  console.log('   Ministarstvo: ~86 izvršilaca');
  console.log('   Zavod za mjeriteljstvo: 24 izvršioca');
  console.log('   FDNI: 28 izvršilaca');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška pri seed-u:', err);
  process.exit(1);
});
