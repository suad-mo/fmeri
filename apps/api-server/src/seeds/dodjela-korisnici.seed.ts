import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { User } from '@nx-fmeri/api-auth';
import {
  OrganizacionaJedinica,
  RadnoMjesto,
  Zaposlenik,
} from '@nx-fmeri/api-org';

const zaposlenici = [
  {
    name: 'Adnan Frljak',
    title: 'Pomocnik direktora za pravne i ekonomske poslove',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Adnan Mahmutovic',
    title: 'Pomocnik direktora za promet, marketing i sigurnost',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Adonisa Djuliman',
    title: 'Pomocnik ministra',
    department: 'Odsjek za pravne poslove i radne odnose',
  },
  {
    name: 'Aida Ahmedovic',
    title: 'Visi referent - tehnicki sekretar',
    department: 'Kabinet ministra',
  },
  {
    name: 'Aida Jelinic',
    title: 'Sef odsjeka za energijsku efikasnost',
    department: 'Sektor energije',
  },
  {
    name: 'Aida Todorovic',
    title: 'Strucni saradnik za plemenite metale',
    department: 'Centar za mjeriteljstvo Sarajevo',
  },
  {
    name: 'Ajdina Hasanovic',
    title: 'Nacelnik centra za verifikaciju i nadzor mjerila Tuzla',
    department: 'Centar za mjeriteljstvo Tuzla',
  },
  {
    name: 'Alen Proho',
    title: 'Visi strucni saradnik za pravne poslove',
    department: 'Sektor energije',
  },
  {
    name: 'Amela Grebovic',
    title: 'Strucni savjetnik za pravne poslove',
    department: 'Sektor industrije',
  },
  {
    name: 'Amela Mikulic',
    title: 'Sef odsjeka za razvoj i unapredjenje privrede',
    department: 'Sektor industrije',
  },
  {
    name: 'Amela Vrace',
    title: 'Strucni saradnik za energetski bilans',
    department: 'Sektor energije',
  },
  {
    name: 'Amela Zdralovic',
    title: 'Visi referent - tehnicki sekretar',
    department: 'Kabinet ministra',
  },
  {
    name: 'Amil Kamenica',
    title: 'Savjetnik ministra za energiju',
    department: 'Kabinet ministra',
  },
  {
    name: 'Amir Halilcevic',
    title: 'Pomocnik ministra',
    department: 'Sektor rudarstva',
  },
  {
    name: 'Amira Brkic',
    title: 'Strucni saradnik za mjeriteljstvo',
    department: 'Centar za mjeriteljstvo Tuzla',
  },
  {
    name: 'Amra Balic',
    title: 'Strucni savjetnik za pravne poslove',
    department: 'Sektor rudarstva',
  },
  {
    name: 'Andrej Kvesic',
    title: 'Strucni saradnik za unapredjenje privrede',
    department: 'Sektor industrije',
  },
  {
    name: 'Angelina Zelenika',
    title: 'Sef Odsjeka za tekstilnu industriju',
    department: 'Sektor industrije',
  },
  {
    name: 'Anita Sunjic',
    title: 'Visi strucni saradnik za ekonomsko-finansijske poslove',
    department: 'Sektor za pravne, finansijske i opce poslove',
  },
  {
    name: 'Arna Kurt',
    title: 'Strucni savjetnik za radne odnose',
    department: 'Odsjek za pravne poslove i radne odnose',
  },
  {
    name: 'Asaf Resulovic',
    title: 'Strucni savjetnik za mjeriteljstvo',
    department: 'Centar za mjeriteljstvo Mostar',
  },
  {
    name: 'Azra Muminagic',
    title: 'Strucni savjetnik za upravljanje energijom',
    department: 'Sektor energije',
  },
  {
    name: 'Begajeta Habota',
    title: 'Sef Odsjeka za geologiju',
    department: 'Odsjek za geologiju',
  },
  {
    name: 'Belma Selimotic',
    title: 'Savjetnik ministra za energiju',
    department: 'Kabinet ministra',
  },
  {
    name: 'Bibica Duzevic',
    title: 'Strucni savjetnik za razvoj privrede',
    department: 'Sektor industrije',
  },
  {
    name: 'Darko Pranjic',
    title: 'Sef Odsjeka za tecne energente, plin i termoenergetiku',
    department: 'Odsjek za tecne energente, plin i termoenergetiku',
  },
  {
    name: 'Dino Delic',
    title: 'Visi referent za mjeriteljstvo i plemenite metale',
    department: 'Centar za mjeriteljstvo Tuzla',
  },
  {
    name: 'Edin Suljkanovic',
    title: 'Visi strucni saradnik za katastar istraznih prostora',
    department: 'Sektor rudarstva',
  },
  {
    name: 'Edina Krpo',
    title: 'Visi samostalni referent za administrativne poslove',
    department: 'Sektor rudarstva',
  },
  {
    name: 'Edita Balavac',
    title: 'Strucni savjetnik za ekonomsko-finansijske poslove',
    department: 'Sektor za pravne, finansijske i opce poslove',
  },
  {
    name: 'Elbisa Zagorcic',
    title: 'Strucni savjetnik za metalnu industriju',
    department: 'Sektor industrije',
  },
  {
    name: 'Eldar Hukic',
    title: 'Pomocnik ministra za energiju',
    department: 'Sektor energije',
  },
  {
    name: 'Eldara Sose',
    title: 'Strucni savjetnik za industriju gradjevinskog materijala',
    department: 'Sektor industrije',
  },
  {
    name: 'Elma Beso',
    title: 'Sef Odsjeka za finansijsko-racunovodstvene poslove',
    department: 'Odsjek za finansijsko-racunovodstvene poslove',
  },
  {
    name: 'Elma Bosnjakovic',
    title: 'Strucni savjetnik za ekonomske poslove',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Fadil Nadarevic',
    title: 'Savjetnik ministra za industriju',
    department: 'Kabinet ministra',
  },
  {
    name: 'Fahrudin Smailagic',
    title: 'Pomocnik direktora',
    department: 'Zavod za mjeriteljstvo',
  },
  {
    name: 'Ivana Musa',
    title: 'Strucni savjetnik za plemenite metale',
    department: 'Centar za mjeriteljstvo Mostar',
  },
  {
    name: 'Ivica Boban',
    title: 'Samostalni referent za opce poslove',
    department: 'Odsjek za opce poslove',
  },
  {
    name: 'Jasmina Suhonjic',
    title: 'Visi samostalni referent za kadrovske poslove',
    department: 'Odsjek za pravne poslove i radne odnose',
  },
  {
    name: 'Jasminka Jonjic',
    title: 'Visi referent za tehnicku dokumentaciju',
    department: 'Sektor industrije',
  },
  {
    name: 'Jasna Vegar',
    title: 'Strucni saradnik - prevodilac',
    department: 'Kabinet ministra',
  },
  {
    name: 'Jelena Marincic',
    title: 'Strucni savjetnik - interni revizor',
    department: 'Federalno ministarstvo energije, rudarstva i industrije',
  },
  {
    name: 'Jelena Trutina',
    title: 'Sef Odsjeka za razvoj i unapredjenje privrede',
    department: 'Odsjek za razvoj i unapredjenje privrede',
  },
  {
    name: 'Lana Rizvanovic',
    title: 'Visi strucni saradnik za informisanje',
    department: 'Kabinet ministra',
  },
  {
    name: 'Lana Trutina',
    title: 'Visi referent za kancelarijsko poslovanje',
    department: 'Pisarnica',
  },
  {
    name: 'Lejla Fazlic',
    title: 'Visi strucni saradnik za pravne poslove',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Magdalena Kordic',
    title: 'Strucni savjetnik za normativno-pravne poslove',
    department: 'Odsjek za pravne poslove i radne odnose',
  },
  {
    name: 'Marica Markovic',
    title: 'Strucni savjetnik za ekonomsko-finansijske poslove',
    department: 'Sektor za pravne, finansijske i opce poslove',
  },
  {
    name: 'Marina Culjak',
    title: 'Sef Odsjeka za finansijsko-racunovodstvene poslove',
    department: 'Odsjek za finansijsko-racunovodstvene poslove',
  },
  {
    name: 'Melisa Mahmutovic',
    title: 'Visi referent za mjeriteljstvo i plemenite metale',
    department: 'Zavod za mjeriteljstvo',
  },
  {
    name: 'Melisa Zahirovic',
    title: 'Strucni savjetnik za razvoj i kvalitet proizvoda',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Mirza Velagic',
    title: 'Strucni savjetnik za plemenite metale',
    department: 'Centar za mjeriteljstvo Sarajevo',
  },
  {
    name: 'Muamer Culum',
    title: 'Sef Odsjeka za normativno-pravne poslove',
    department: 'Odsjek za pravne poslove i radne odnose',
  },
  {
    name: 'Nermina Husic',
    title: 'Strucni saradnik za energetski bilans',
    department: 'Sektor energije',
  },
  {
    name: 'Nihad Kisic',
    title: 'Strucni saradnik za mjeriteljstvo',
    department: 'Centar za mjeriteljstvo Sarajevo',
  },
  {
    name: 'Nihada Dupovac',
    title: 'Visi referent - tehnicki sekretar',
    department: 'Kabinet ministra',
  },
  {
    name: 'Omer Sator',
    title: 'Visi strucni saradnik za elektroenergetiku',
    department: 'Sektor energije',
  },
  {
    name: 'Redzo Delic',
    title: 'Sef Grupe za razvoj i kontrolu kvaliteta proizvoda',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Samra Kadribegovic',
    title: 'Strucni savjetnik za normativno-pravne poslove',
    department: 'Federalno ministarstvo energije, rudarstva i industrije',
  },
  {
    name: 'Sanella Cero',
    title: 'Strucni saradnik - lektor',
    department: 'Odsjek za pravne poslove i radne odnose',
  },
  {
    name: 'Sanja Skaramuca',
    title: 'Strucni savjetnik za osnovna geoloska istrazivanja',
    department: 'Odsjek za geologiju',
  },
  {
    name: 'Sanjin Habul',
    title: 'Visi strucni saradnik za elektroenergetiku',
    department: 'Odsjek za elektroenergetiku',
  },
  {
    name: 'Sedin Alispahic',
    title: 'Visi strucni saradnik za katastar istraznih prostora',
    department: 'Odsjek za geologiju',
  },
  { name: 'Selma Stranjak', title: 'Sef Pisarnice', department: 'Pisarnica' },
  {
    name: 'Semir Mehremic',
    title: 'Strucni savjetnik za razvoj informacionog sistema',
    department: 'Kabinet ministra',
  },
  {
    name: 'Senad Kurtcehajic',
    title: 'Nacelnik centra za verifikaciju i nadzor mjerila Sarajevo',
    department: 'Centar za mjeriteljstvo Sarajevo',
  },
  {
    name: 'Senad Zekic',
    title: 'Sef odsjeka za analizu i pracenje stanja u privredi',
    department: 'Odsjek za analizu i pracenje stanja u privredi',
  },
  {
    name: 'Smilja Sesar',
    title: 'Strucni savjetnik za metalicne mineralne sirovine',
    department: 'Odsjek za rudarstvo',
  },
  {
    name: 'Suad Krvavac',
    title: 'Sef grupe za proizvodnju i remont',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Vahidin Perenda',
    title: 'Strucni savjetnik za mjeriteljstvo',
    department: 'Centar za mjeriteljstvo Mostar',
  },
  {
    name: 'Zlatan Bilanovic',
    title: 'Direktor Federalne direkcije za namjensku industriju',
    department: 'Federalna direkcija za namjensku industriju',
  },
  {
    name: 'Zeljka Pusic',
    title: 'Visi referent za mjeriteljstvo i plemenite metale',
    department: 'Centar za mjeriteljstvo Sarajevo',
  },
];

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  const jedinice = await OrganizacionaJedinica.find({}).lean();
  const radnaMjesta = await RadnoMjesto.find({}).lean();

  // Normalizacija stringa — uklanja dijakritike za poređenje
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[šś]/g, 's')
      .replace(/[žź]/g, 'z')
      .replace(/[đd]/g, 'd')
      .replace(/[–—-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const nadjiJedinicu = (dept: string) => {
    const normDept = normalize(dept);
    return jedinice.find((j) => normalize(j.naziv) === normDept) ?? null;
  };

  const nadjiRM = (title: string, jedinicaId: mongoose.Types.ObjectId) => {
    if (!title) return null;
    const normTitle = normalize(title);

    // Traži u istoj org. jedinici
    const uJedinici = radnaMjesta.filter(
      (rm) => rm.organizacionaJedinica.toString() === jedinicaId.toString(),
    );

    for (const rm of uJedinici) {
      const rmNorm = normalize(rm.naziv);
      const words = normTitle.split(' ').filter((w) => w.length > 4);
      const matchCount = words.filter((w) => rmNorm.includes(w)).length;
      if (matchCount >= 2) return rm;
    }

    // Traži u svim radnim mjestima
    for (const rm of radnaMjesta) {
      const rmNorm = normalize(rm.naziv);
      const words = normTitle.split(' ').filter((w) => w.length > 4);
      const matchCount = words.filter((w) => rmNorm.includes(w)).length;
      if (matchCount >= 3) return rm;
    }

    return null;
  };

  let dodjeljeno = 0;
  let nijePronadjenoJedinica = 0;
  let nijePronadjenoRM = 0;

  for (const z of zaposlenici) {
    // Traži usera po prvom dijelu imena
    const imeDijeli = z.name.split(' ');
    const user = await User.findOne({
      name: { $regex: new RegExp(imeDijeli[0], 'i') },
    });

    if (!user) {
      console.log(`  ⚠️  User nije pronađen: ${z.name}`);
      continue;
    }

    const jedinica = nadjiJedinicu(z.department);
    if (!jedinica) {
      console.log(
        `  ⚠️  Org. jedinica nije pronađena: "${z.department}" (${z.name})`,
      );
      nijePronadjenoJedinica++;
      continue;
    }

    const rm = z.title
      ? nadjiRM(z.title, jedinica._id as mongoose.Types.ObjectId)
      : null;
    if (!rm && z.title) {
      console.log(
        `  ℹ️  Radno mjesto nije pronađeno: "${z.title}" → ${jedinica.naziv}`,
      );
      nijePronadjenoRM++;
    }

    // Koristi:
    await Zaposlenik.updateOne(
      { user: user._id },
      {
        organizacionaJedinica: jedinica._id,
        radnoMjesto: rm ? rm._id : null,
      },
    );

    console.log(
      `  ✓ ${z.name} → ${jedinica.naziv}${rm ? ` | ${rm.naziv}` : ' | (bez RM)'}`,
    );
    dodjeljeno++;
  }

  console.log(`\n✅ Završeno!`);
  console.log(`   Dodijeljeno: ${dodjeljeno}`);
  console.log(`   Org. jedinica nije pronađena: ${nijePronadjenoJedinica}`);
  console.log(`   Radno mjesto nije pronađeno: ${nijePronadjenoRM}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
