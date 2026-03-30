import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { User } from '@nx-fmeri/api-auth';
import { OrganizacionaJedinica, RadnoMjesto } from '@nx-fmeri/api-org';

const zaposlenici = [
  { name: 'Adnan Frljak',        title: 'Pomoćnik direktora za pravne i ekonomske poslove',           department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Adnan Mahmutović',    title: 'Pomoćnik direktora za promet, marketing i sigurnost',          department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Adonisa Đuliman',     title: 'Pomoćnik ministra',                                            department: 'Sektor za normativno-pravne poslove i radne odnose' },
  { name: 'Aida Ahmedović',      title: 'Viši referent - tehnički sekretar',                            department: 'Kabinet ministra' },
  { name: 'Aida Jelinić',        title: 'Šef odsjeka za energijsku efikasnost',                         department: 'Sektor energije' },
  { name: 'Aida Todorović',      title: 'Stručni saradnik za plemenite metale',                         department: 'Centar za mjeriteljstvo Sarajevo' },
  { name: 'Ajdina Hasanović',    title: 'Načelnik centra za verifikaciju i nadzor mjerila Tuzla',        department: 'Centar za mjeriteljstvo Tuzla' },
  { name: 'Alen Proho',          title: 'Viši stručni saradnik za pravne poslove',                      department: 'Sektor energije' },
  { name: 'Amela Grebović',      title: 'Stručni savjetnik za pravne poslove',                          department: 'Sektor industrije' },
  { name: 'Amela Mikulić',       title: 'Šef odsjeka za razvoj i unapređenje privrede',                 department: 'Sektor industrije' },
  { name: 'Amela Vrače',         title: 'Stručni saradnik za energetski bilans',                        department: 'Sektor energije' },
  { name: 'Amela Ždraloviić',    title: 'Viši referent - tehnički sekretar',                            department: 'Kabinet ministra' },
  { name: 'Amil Kamenica',       title: 'Savjetnik ministra za energiju',                               department: 'Kabinet ministra' },
  { name: 'Amir Halilčević',     title: 'Pomoćnik ministra',                                            department: 'Sektor rudarstva' },
  { name: 'Amira Brkić',         title: 'Stručni saradnik za mjeriteljstvo',                            department: 'Centar za mjeriteljstvo Tuzla' },
  { name: 'Amra Balić',          title: 'Stručni savjetnik za pravne poslove',                          department: 'Sektor rudarstva' },
  { name: 'Andrej Kvesić',       title: 'Stručni saradnik za unapređenje privrede',                     department: 'Sektor industrije' },
  { name: 'Angelina Zelenika',   title: 'Šef Odsjeka za tekstilnu industriju',                          department: 'Sektor industrije' },
  { name: 'Anita Šunjić',        title: 'Viši stručni saradnik za ekonomsko-finansijske poslove',        department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Arna Kurt',           title: 'Stručni savjetnik za radne odnose',                            department: 'Sektor za normativno-pravne poslove i radne odnose' },
  { name: 'Asaf Resulović',      title: 'Stručni savjetnik za mjeriteljstvo',                           department: 'Centar za mjeriteljstvo Mostar' },
  { name: 'Azra Muminagić Šuta', title: 'Stručni savjetnik za upravljanje energijom',                   department: 'Sektor energije' },
  { name: 'Begajeta Habota',     title: 'Šef Odsjeka za geologiju',                                    department: 'Sektor rudarstva' },
  { name: 'Belma Selimotić',     title: 'Savjetnik ministra za energiju',                               department: 'Kabinet ministra' },
  { name: 'Bibica Dužević',      title: 'Stručni savjetnik za razvoj privrede',                         department: 'Sektor industrije' },
  { name: 'Darko Pranjić',       title: 'Šef Odsjeka za tečne energente, plin i termoenergetiku',       department: 'Odsjek za tečne energente, plin i termoenergetiku' },
  { name: 'Dino Delić',          title: 'Viši referent za mjeriteljstvo i plemenite metale',            department: 'Centar za mjeriteljstvo Tuzla' },
  { name: 'Edin Suljkanović',    title: 'Viši stručni saradnik za katastar istražnih prostora',         department: 'Sektor rudarstva' },
  { name: 'Edina Krpo',          title: 'Viši samostalni referent za administrativne poslove',           department: 'Sektor rudarstva' },
  { name: 'Edita Balavac',       title: 'Stručni savjetnik za ekonomsko-finansijske poslove',            department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Elbisa Zagorčić',     title: 'Stručni savjetnik za metalnu industriju',                      department: 'Sektor industrije' },
  { name: 'Eldar Hukić',         title: 'Pomoćnik ministra za energiju',                               department: 'Sektor energije' },
  { name: 'Eldara Šoše',         title: 'Stručni savjetnik za industriju građ. materijala i nemetale',  department: 'Sektor industrije' },
  { name: 'Elma Bešo',           title: 'Šef Odsjeka za finansijsko-računovodstvene poslove',           department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Elma Bošnjaković',    title: 'Stručni savjetnik za ekonomske poslove',                       department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Fadil Nadarević',     title: 'Savjetnik ministra za industriju',                             department: 'Kabinet ministra' },
  { name: 'Fahrudin Smailagić',  title: 'Pomoćnik direktora',                                           department: 'Zavod za mjeriteljstvo' },
  { name: 'Ivana Musa',          title: 'Stručni savjetnik za plemenite metale',                        department: 'Centar za mjeriteljstvo Mostar' },
  { name: 'Ivica Boban',         title: 'Samostalni referent za opće poslove',                          department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Jasmina Suhonjić',    title: 'Viši samostalni referent za kadrovske i administrativne poslove', department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Jasminka Jonjić',     title: 'Viši referent za tehničku dokumentaciju',                      department: 'Sektor industrije' },
  { name: 'Jasna Vegar',         title: 'Stručni saradnik - prevodilac',                               department: 'Kabinet ministra' },
  { name: 'Jelena Marinčić',     title: 'Stručni savjetnik — interni revizor',                         department: 'Federalno ministarstvo energije, rudarstva i industrije' },
  { name: 'Jelena Trutina',      title: 'Šef Odsjeka za razvoj i unapređenje privrede',                 department: 'Sektor industrije' },
  { name: 'Lana Rizvanović',     title: 'Viši stručni saradnik za informisanje',                        department: 'Kabinet ministra' },
  { name: 'Lana Trutina',        title: 'Viši referent za kancelarijsko poslovanje',                    department: 'Pisarnica' },
  { name: 'Lejla Fazlić',        title: 'Viši stručni saradnik za pravne poslove',                      department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Magdalena Kordić',    title: 'Stručni savjetnik za normativno-pravne poslove',               department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Marica Marković',     title: 'Stručni savjetnik za ekonomsko-finansijske poslove',            department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Marina Ćuljak',       title: 'Šef Odsjeka za finansijsko-računovodstvene poslove',           department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Melisa Mahmutović',   title: 'Viši referent za mjeriteljstvo i plemenite metale',            department: 'Zavod za mjeriteljstvo' },
  { name: 'Melisa Zahirović',    title: 'Stručni savjetnik za razvoj i kvalitet proizvoda',             department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Mirza Velagić',       title: 'Stručni savjetnik za plemenite metale',                        department: 'Centar za mjeriteljstvo Sarajevo' },
  { name: 'Muamer Ćulum',        title: 'Šef Odsjeka za normativno-pravne poslove',                     department: 'Sektor za pravne, finansijske i opće poslove' },
  { name: 'Nermina Husić',       title: 'Stručni saradnik za energetski bilans',                        department: 'Sektor energije' },
  { name: 'Nihad Kišić',         title: 'Stručni saradnik za mjeriteljstvo',                            department: 'Centar za mjeriteljstvo Sarajevo' },
  { name: 'Nihada Dupovac',      title: 'Viši referent - tehnički sekretar',                            department: 'Kabinet ministra' },
  { name: 'Omer Šator',          title: 'Viši stručni saradnik za elektroenergetiku',                   department: 'Sektor energije' },
  { name: 'Redžo Delić',         title: 'Šef Grupe za razvoj i kontrolu kvaliteta proizvoda',           department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Samra Kadribegović',  title: 'Stručni savjetnik za normativno-pravne poslove',               department: 'Federalno ministarstvo energije, rudarstva i industrije' },
  { name: 'Sanella Cero',        title: 'Stručni saradnik - lektor',                                   department: 'Sektor za normativno-pravne poslove i radne odnose' },
  { name: 'Sanja Skaramuca',     title: 'Stručni savjetnik za osnovna geološka istraživanja',           department: 'Sektor rudarstva' },
  { name: 'Sanjin Habul',        title: 'Viši stručni saradnik za elektroenergetiku',                   department: 'Sektor energije' },
  { name: 'Sedin Alispahić',     title: 'Viši stručni saradnik za katastar istražnih prostora',         department: 'Sektor rudarstva' },
  { name: 'Selma Stranjak',      title: 'Šef Pisarnice',                                               department: 'Pisarnica' },
  { name: 'Semir Mehremić',      title: 'Stručni savjetnik za razvoj informacionog sistema',            department: 'Kabinet ministra' },
  { name: 'Senad Kurtćehajić',   title: 'Načelnik centra za verifikaciju i nadzor mjerila Sarajevo',    department: 'Centar za mjeriteljstvo Sarajevo' },
  { name: 'Senad Zekić',         title: 'Šef odsjeka za analizu i praćenje stanja u privredi',          department: 'Sektor industrije' },
  { name: 'Smilja Sesar',        title: 'Stručni savjetnik za metalične mineralne sirovine',            department: 'Sektor rudarstva' },
  { name: 'Suad Krvavac',        title: 'Šef grupe za proizvodnju i remont',                            department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Vahidin Perenda',     title: 'Stručni savjetnik za mjeriteljstvo',                           department: 'Centar za mjeriteljstvo Mostar' },
  { name: 'Zlatan Bilanović',    title: 'Direktor Federalne direkcije za namjensku industriju',          department: 'Federalna direkcija za namjensku industriju' },
  { name: 'Željka Pušić',        title: 'Viši referent za mjeriteljstvo i plemenite metale',            department: 'Centar za mjeriteljstvo Sarajevo' },
];

const DEPARTMENT_MAPPING: Record<string, string> = {
  'Kabinet ministra': 'Kabinet ministra',
  'Sektor energije': 'Sektor energije',
  'Sektor rudarstva': 'Sektor rudarstva',
  'Odsjek za tečne energente, plin i termoenergetiku': 'Odsjek za tečne energente, plin i termoenergetiku',
  'Sektor industrije': 'Sektor industrije',
  'Sektor za pravne, finansijske i opće poslove': 'Sektor za pravne, finansijske i opće poslove',
  'Sektor za normativno-pravne poslove i radne odnose': 'Odsjek za pravne poslove i radne odnose',
  'Pisarnica': 'Pisarnica',
  'Zavod za mjeriteljstvo': 'Zavod za mjeriteljstvo',
  'Centar za mjeriteljstvo Sarajevo': 'Centar za mjeriteljstvo Sarajevo',
  'Centar za mjeriteljstvo Mostar': 'Centar za mjeriteljstvo Mostar',
  'Centar za mjeriteljstvo Tuzla': 'Centar za mjeriteljstvo Tuzla',
  'Federalna direkcija za namjensku industriju': 'Federalna direkcija za namjensku industriju',
  'Federalno ministarstvo energije, rudarstva i industrije': 'Federalno ministarstvo energije, rudarstva i industrije',
};

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  const jedinice = await OrganizacionaJedinica.find({}).lean();
  const radnaMjesta = await RadnoMjesto.find({}).lean();

  const nadjiJedinicu = (dept: string) => {
    const mappedName = DEPARTMENT_MAPPING[dept] ?? dept;
    return jedinice.find((j) => j.naziv === mappedName) ?? null;
  };

  const nadjiRM = (title: string, jedinicaId: mongoose.Types.ObjectId) => {
    if (!title) return null;

    const titleLower = title.toLowerCase().replace(/–|-/g, ' ').trim();

    // Traži u istoj org. jedinici
    const uJedinici = radnaMjesta.filter(
      (rm) => rm.organizacionaJedinica.toString() === jedinicaId.toString()
    );

    // Pokušaj poklapanja
    for (const rm of uJedinici) {
      const rmLower = rm.naziv.toLowerCase().replace(/–|-/g, ' ');
      const titleWords = titleLower.split(' ').filter((w) => w.length > 4);
      const matchCount = titleWords.filter((w) => rmLower.includes(w)).length;
      if (matchCount >= 2) return rm;
    }

    // Ako nije pronađeno u jedinici, traži u svim
    for (const rm of radnaMjesta) {
      const rmLower = rm.naziv.toLowerCase().replace(/–|-/g, ' ');
      const titleWords = titleLower.split(' ').filter((w) => w.length > 4);
      const matchCount = titleWords.filter((w) => rmLower.includes(w)).length;
      if (matchCount >= 3) return rm;
    }

    return null;
  };

  let dodjeljeno = 0;
  let nijePronađenoJedinica = 0;
  let nijePronađenoRM = 0;

  for (const z of zaposlenici) {
    const user = await User.findOne({
      name: { $regex: new RegExp(z.name.split(' ')[0], 'i') },
    });

    if (!user) {
      console.log(`  ⚠️  User nije pronađen: ${z.name}`);
      continue;
    }

    const jedinica = nadjiJedinicu(z.department);
    if (!jedinica) {
      console.log(`  ⚠️  Org. jedinica nije pronađena: "${z.department}" (${z.name})`);
      nijePronađenoJedinica++;
      continue;
    }

    const rm = z.title ? nadjiRM(z.title, jedinica._id as mongoose.Types.ObjectId) : null;
    if (!rm && z.title) {
      console.log(`  ℹ️  Radno mjesto nije pronađeno: "${z.title}" → ${jedinica.naziv}`);
      nijePronađenoRM++;
    }

    await User.updateOne(
      { _id: user._id },
      {
        organizacionaJedinica: jedinica._id,
        radnoMjesto: rm ? rm._id : null,
      }
    );

    console.log(`  ✓ ${z.name} → ${jedinica.naziv}${rm ? ` | ${rm.naziv}` : ' | (bez RM)'}`);
    dodjeljeno++;
  }

  console.log(`\n✅ Završeno!`);
  console.log(`   Dodijeljeno: ${dodjeljeno}`);
  console.log(`   Org. jedinica nije pronađena: ${nijePronađenoJedinica}`);
  console.log(`   Radno mjesto nije pronađeno: ${nijePronađenoRM}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
