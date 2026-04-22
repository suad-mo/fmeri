import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

import mongoose from 'mongoose';
import { User } from '@nx-fmeri/api-auth';

const seed = async () => {
  const mongoUri = process.env['MONGODB_URI'] as string;
  await mongoose.connect(mongoUri);
  console.log('Povezan na MongoDB');

  // Obrišemo samo non-admin korisnike
  await User.deleteMany({ role: { $ne: 'admin' } });
  console.log('Obrisani postojeći korisnici (osim admina)');

  const zaposlenici = [
    // ── Kabinet ministra ──────────────────────────────────
    { name: 'Amela Ždraloviić',   email: 'Amela.Zdralovic@fmeri.gov.ba',   title: 'Viši referent – tehnički sekretar',                    department: 'Kabinet ministra' },
    { name: 'Amil Kamenica',      email: 'Amil.Kamenica@fmeri.gov.ba',     title: 'Savjetnik ministra za energiju',                        department: 'Kabinet ministra' },
    { name: 'Ema Kolašinac',      email: 'ema.kolasinac@fmeri.gov.ba',     title: '',                                                      department: 'Kabinet ministra' },
    { name: 'Fadil Nadarević',    email: 'Fadil.Nadarevic@fmeri.gov.ba',   title: 'Savjetnik ministra za industriju',                      department: 'Kabinet ministra' },
    { name: 'Jasmina Pašić',      email: 'jasmina.pasic@fmeri.gov.ba',     title: '',                                                      department: 'Kabinet ministra' },
    { name: 'Jasna Vegar',        email: 'jasna.vegar@fmeri.gov.ba',       title: 'Stručni saradnik - prevodilac',                         department: 'Kabinet ministra' },
    { name: 'Lana Rizvanović',    email: 'lana.rizvanovic@fmeri.gov.ba',   title: 'Viši stručni saradnik za informisanje',                 department: 'Kabinet ministra' },
    { name: 'Nihada Dupovac',     email: 'Nihada.Dupovac@fmeri.gov.ba',    title: 'Viši referent – tehnički sekretar',                    department: 'Kabinet ministra' },
    { name: 'Rijad Vrabac',       email: 'Rijad.Vrabac@fmeri.gov.ba',      title: '',                                                      department: 'Kabinet ministra' },

    // ── Sektor energije ───────────────────────────────────
    { name: 'Aida Jelinić',       email: 'aida.jelinic@fmeri.gov.ba',      title: 'Šef odsjeka za energijsku efikasnost',                  department: 'Sektor energije' },
    { name: 'Alen Proho',         email: 'Alen.Proho@fmeri.gov.ba',        title: 'Viši stručni saradnik za pravne poslove',               department: 'Sektor energije' },
    { name: 'Amela Vrače',        email: 'Amela.Vrace@fmeri.gov.ba',       title: 'Stručni saradnik za energetski bilans',                 department: 'Sektor energije' },
    { name: 'Azra Muminagić Šuta',email: 'Azra.Muminagic.Suta@fmeri.gov.ba', title: 'Stručni savjetnik za upravljanje energijom',         department: 'Sektor energije' },
    { name: 'Belma Selimotić',    email: 'Belma.Selimotic@fmeri.gov.ba',   title: 'Savjetnik/EU4energy',                                   department: 'Sektor energije' },
    { name: 'Eldar Hukić',        email: 'Eldar.Hukic@fmeri.gov.ba',       title: 'Pomoćnik ministra za energiju',                         department: 'Sektor energije' },
    { name: 'Nermina Husić',      email: 'Nermina.Husic@fmeri.gov.ba',     title: 'Stručni saradnik za energetski bilans',                 department: 'Sektor energije' },
    { name: 'Omer Šator',         email: 'Omer.Sator@fmeri.gov.ba',        title: 'Viši stručni saradnik',                                 department: 'Sektor energije' },
    { name: 'Sanjin Habul',       email: 'Sanjin.Habul@fmeri.gov.ba',      title: 'Viši stručni saradnik za elektroenergetiku',            department: 'Odsjek za elektroenergetiku' },

    // ── Sektor rudarstva ──────────────────────────────────
    { name: 'Amir Halilčević',    email: 'Amir.Halilcevic@fmeri.gov.ba',   title: 'Pomoćnik ministra',                                     department: 'Sektor rudarstva' },
    { name: 'Amra Balić',         email: 'Amra.Balic@fmeri.gov.ba',        title: 'Stručni savjetnik za pravne poslove',                   department: 'Sektor rudarstva' },
    { name: 'Begajeta Habota',    email: 'begajeta.habota@fmeri.gov.ba',   title: 'Šef Odsjeka za geologiju',                              department: 'Sektor rudarstva' },
    { name: 'Darko Pranjić',      email: 'darko.pranjic@fmeri.gov.ba',     title: 'Šef Odsjeka za tečne energente, plin i termoenergetiku',department: 'Sektor rudarstva' },
    { name: 'Edin Suljkanović',   email: 'Edin.Suljkanovic@fmeri.gov.ba',  title: 'Savjetnik',                                             department: 'Sektor rudarstva' },
    { name: 'Edina Krpo',         email: 'edina.krpo@fmeri.gov.ba',        title: 'Viši samostalni referent za administrativne poslove',   department: 'Sektor rudarstva' },
    { name: 'Sanja Skaramuca',    email: 'Sanja.Skaramuca@fmeri.gov.ba',   title: 'Stručni savjetnik za osnovna geološka istraživanja',    department: 'Sektor rudarstva' },
    { name: 'Sedin Alispahić',    email: 'sedin.alispahic@fmeri.gov.ba',   title: 'Viši stručni saradnik za katastar istražnih prostora',  department: 'Sektor rudarstva' },
    { name: 'Smilja Sesar',       email: 'Smilja.Sesar@fmeri.gov.ba',      title: 'Stručni savjetnik za metlačne mineralne sirovine',      department: 'Sektor rudarstva' },

    // ── Sektor industrije ─────────────────────────────────
    { name: 'Amela Grebović',     email: 'amela.grebovic@fmeri.gov.ba',    title: 'Stručni savjetnik za pravne poslove',                   department: 'Sektor industrije' },
    { name: 'Amela Mikulić',      email: 'amela.mikulic@fmeri.gov.ba',     title: 'Šef odsjeka za razvoj i unapređenje privrede',          department: 'Sektor industrije' },
    { name: 'Andrej Kvesić',      email: 'Andrej.Kvesic@fmeri.gov.ba',     title: 'Stručni saradnik za unapređenje privrede',              department: 'Sektor industrije' },
    { name: 'Angelina Zelenika',  email: 'angelina.zelenika@fmeri.gov.ba', title: 'Šef Odsjeka za tekstilnu industriju',                   department: 'Sektor industrije' },
    { name: 'Bibica Dužević',     email: 'bibica.duzevic@fmeri.gov.ba',    title: 'Stručni savjetnik za razvoj privrede',                  department: 'Sektor industrije' },
    { name: 'Elbisa Zagorčić',    email: 'elbisa.zagorcic@fmeri.gov.ba',   title: 'Stručni savjetnik za metalnu industriju',               department: 'Sektor industrije' },
    { name: 'Eldara Šoše',        email: 'eldara.sose@fmeri.gov.ba',       title: 'Stručni savjetnik za industriju građ. materijala',      department: 'Sektor industrije' },
    { name: 'Jasminka Jonjić',    email: 'jasminka.jonjic@fmeri.gov.ba',   title: 'Viši referent za tehničku dokumentaciju',               department: 'Sektor industrije' },
    { name: 'Jelena Trutina',     email: 'jelena.trutina@fmeri.gov.ba',    title: 'Šef Odsjeka za razvoj i unapređenje privrede',          department: 'Sektor industrije' },
    { name: 'Senad Zekić',        email: 'senad.zekic@fmeri.gov.ba',       title: 'Šef odsjeka za analizu i praćenje stanja u privredi',   department: 'Sektor industrije' },

    // ── Sektor za normativno-pravne poslove i radne odnose ─
    { name: 'Adonisa Đuliman',    email: 'Adonisa.Djuliman@fmeri.gov.ba',  title: 'Pomoćnik ministra',                                     department: 'Sektor za normativno-pravne poslove i radne odnose' },
    { name: 'Arna Kurt',          email: 'Arna.Kurt@fmeri.gov.ba',         title: 'Stručni savjetnik za radne odnose',                     department: 'Sektor za normativno-pravne poslove i radne odnose' },
    { name: 'Lana Trutina',       email: 'Lana.Trutina@fmeri.gov.ba',      title: 'Viši referent za kancelarijsko poslovanje',             department: 'Sektor za normativno-pravne poslove i radne odnose' },
    { name: 'Magdalena Kordić',   email: 'Magdalena.Kordic@fmeri.gov.ba',  title: 'Stručni savjetnik za normativno-pravne poslove',        department: 'Sektor za pravne, finansijske i opće poslove' },
    { name: 'Muamer Ćulum',       email: 'muamer.culum@fmeri.gov.ba',      title: 'Šef Odsjeka za normativno-pravne poslove',              department: 'Sektor za pravne, finansijske i opće poslove' },
    { name: 'Sanella Cero',       email: 'Sanella.Cero@fmeri.gov.ba',      title: 'Stručni saradnik – lektor',                            department: 'Sektor za normativno-pravne poslove i radne odnose' },
    { name: 'Selma Stranjak',     email: 'selma.stranjak@fmeri.gov.ba',    title: 'Šef Pisarnice',                                         department: 'Pisarnica' },
    { name: 'Jasmina Suhonjić',   email: 'jasmina.suhonjic@fmeri.gov.ba', title: 'Viši samostalni referent za kadrovske poslove',         department: 'Sektor za pravne, finansijske i opće poslove' },

    // ── Služba za finansijsko-računovodstvene poslove ──────
    { name: 'Anita Šunjić',       email: 'anita.sunjic@fmeri.gov.ba',      title: 'Viši stručni saradnik za ekonomsko-finansijske poslove',department: 'Služba za finansijsko-računovodstvene poslove' },
    { name: 'Edita Balavac',      email: 'edita.balavac@fmeri.gov.ba',     title: 'Stručni savjetnik za ekonomsko-finansijske poslove',    department: 'Služba za finansijsko-računovodstvene poslove' },
    { name: 'Elma Bešo',          email: 'Elma.Beso@fmeri.gov.ba',         title: 'Šef Odsjeka za finansijsko-računovodstvene poslove',    department: 'Služba za finansijsko-računovodstvene poslove' },
    { name: 'Ivica Boban',        email: 'Ivica.Boban@fmeri.gov.ba',       title: 'Samostalni referent za opšte poslove',                  department: 'Služba za finansijsko-računovodstvene poslove' },
    { name: 'Marica Marković',    email: 'marica.markovic@fmeri.gov.ba',   title: 'Savjetnik za pravne i ekonomske poslove',               department: 'Služba za finansijsko-računovodstvene poslove' },
    { name: 'Marina Ćuljak',      email: 'marina.culjak@fmeri.gov.ba',     title: 'Šef Službe za finansijsko-računovodstvene poslove',     department: 'Služba za finansijsko-računovodstvene poslove' },
    { name: 'Semir Mehremić',     email: 'semir.mehremic@fmeri.gov.ba',    title: 'Stručni savjetnik za razvoj informacionog sistema',     department: 'Služba za finansijsko-računovodstvene poslove' },

    // ── Jedinica za internu reviziju ───────────────────────
    { name: 'Jelena Marinčić',    email: 'Jelena.Marincic@fmeri.gov.ba',   title: 'Interni revizor',                                       department: 'Jedinica za internu reviziju' },
    { name: 'Lejla Sarajlić-Macić',email: 'Lejla.Sarajlic-Macic@fmeri.gov.ba', title: 'Stručni savjetnik – interni revizor',              department: 'Jedinica za internu reviziju' },

    // ── Zavod za mjeriteljstvo ────────────────────────────
    { name: 'Fahrudin Smailagić', email: 'Fahrudin.Smailagic@fmeri.gov.ba',title: 'Pomoćnik direktora',                                    department: 'Zavod za mjeriteljstvo' },
    { name: 'Melisa Mahmutović',  email: 'melisa.mahmutovic@fmeri.gov.ba', title: 'Viši referent za mjeriteljstvo i plemenite metale',     department: 'Zavod za mjeriteljstvo FBiH' },
    { name: 'Senad Kurtćehajić',  email: 'senad.kurtcehajic@fmeri.gov.ba', title: 'Načelnik centra za verifikaciju i nadzor mjerila Sarajevo', department: 'Zavod za mjeriteljstvo' },

    // ── Zavod za mjeriteljstvo - Centar Sarajevo ──────────
    { name: 'Aida Ahmedović',     email: 'Aida.Ahmedovic@fmeri.gov.ba',    title: 'Viši referent – tehnički sekretar',                    department: 'Zavod za mjeriteljstvo-Centar Sarajevo' },
    { name: 'Aida Todorović',     email: 'Aida.Todorovic@fmeri.gov.ba',    title: 'Stručni saradnik za plemenite metale',                  department: 'Zavod za mjeriteljstvo-Centar Sarajevo' },
    { name: 'Mirza Velagić',      email: 'Mirza.Velagic@fmeri.gov.ba',     title: 'Stručni savjetnik za plemenite metale',                 department: 'Zavod za mjeriteljstvo-Centar Sarajevo' },
    { name: 'Nihad Kišić',        email: 'Nihad.Kisic@fmeri.gov.ba',       title: 'Stručni saradnik za mjeriteljstvo',                     department: 'Zavod za mjeriteljstvo-Centar Sarajevo' },
    { name: 'Željka Pušić',       email: 'Zeljka.Pusic@fmeri.gov.ba',      title: 'Viši referent za mjeriteljstvo i plemenite metale',     department: 'Zavod za mjeriteljstvo-Centar Sarajevo' },

    // ── Zavod za mjeriteljstvo - Centar Mostar ────────────
    { name: 'Asaf Resulović',     email: 'Asaf.Resulovic@fmeri.gov.ba',    title: 'Stručni savjetnik za mjeriteljstvo',                    department: 'Zavod za mjeriteljstvo-Centar Mostar' },
    { name: 'Ivana Musa',         email: 'Ivana.Musa@fmeri.gov.ba',        title: 'Stručni savjetnik za plemenite metale',                 department: 'Zavod za mjeriteljstvo-Centar Mostar' },
    { name: 'Vahidin Perenda',    email: 'Vahidin.Perenda@fmeri.gov.ba',   title: 'Stručni savjetnik za mjeriteljstvo',                    department: 'Zavod za mjeriteljstvo-Centar Mostar' },

    // ── Zavod za mjeriteljstvo - Centar Tuzla ─────────────
    { name: 'Ajdina Hasanović',   email: 'Ajdina.Hasanovic@fmeri.gov.ba',  title: 'Načelnik centra za verifikaciju i nadzor mjerila Tuzla',department: 'Zavod za mjeriteljstvo-Centar Tuzla' },
    { name: 'Amira Brkić',        email: 'Amira.Brkic@fmeri.gov.ba',       title: 'Stručni saradnik za mjeriteljstvo',                     department: 'Zavod za mjeriteljstvo-Centar Tuzla' },
    { name: 'Dino Delić',         email: 'Dino.Delic@fmeri.gov.ba',        title: 'Viši referent za mjeriteljstvo i plemenite metale',     department: 'Zavod za mjeriteljstvo-Centar Tuzla' },

    // ── Federalna direkcija namjenske industrije ──────────
    { name: 'Adnan Frljak',       email: 'Adnan.Frljak@fmeri.gov.ba',      title: 'Pomoćnik direktora za pravne i ekonomske poslove',      department: 'Federalna direkcija namjenske industrije' },
    { name: 'Adnan Mahmutović',   email: 'Adnan.Mahmutovic@fmeri.gov.ba',  title: 'Pomoćnik direktora za promet, marketing i sigurnost',   department: 'Federalna direkcija namjenske industrije' },
    { name: 'Elma Bošnjaković',   email: 'Elma.Bosnjakov@fmeri.gov.ba',    title: 'Stručni savjetnik za ekonomske poslove',                department: 'Federalna direkcija namjenske industrije' },
    { name: 'Lejla Fazlić',       email: 'Lejla.Fazlic@fmeri.gov.ba',      title: 'Viši stručni saradnik za pravne poslove',               department: 'Federalna direkcija za namjensku industriju' },
    { name: 'Melisa Zahirović',   email: 'Melisa.Zahirovic@fmeri.gov.ba',  title: 'Stručni savjetnik za razvoj i kvalitet proizvoda',      department: 'Federalna direkcija namjenske industrije' },
    { name: 'Redžo Delić',        email: 'Redzo.Delic@fmeri.gov.ba',       title: 'Šef Grupe za razvoj i kontrolu kvaliteta proizvoda',    department: 'Federalna direkcija namjenske industrije' },
    { name: 'Suad Krvavac',       email: 'suad.krvavac@fmeri.gov.ba',      title: 'Šef grupe za proizvodnju i remont',                     department: 'Federalna direkcija namjenske industrije' },
    { name: 'Zlatan Bilanović',   email: 'Zlatan.Bilanovic@fmeri.gov.ba',  title: 'Direktor Federalne direkcije za namjensku industriju',  department: 'Federalna direkcija namjenske industrije' },

    // ── Ostali ────────────────────────────────────────────
    { name: 'Lejla Jugo',         email: 'Lejla.Jugo@fmeri.gov.ba',        title: 'Volonter',                                              department: '' },
    { name: 'Mario Pezer',        email: 'mario.pezer@fmeri.gov.ba',       title: '',                                                      department: '' },
    { name: 'Samra Kadribegović', email: 'samra.kadribegovic@fmeri.gov.ba',title: 'Načelnica Službe za strateško planiranje',              department: 'Služba za strateško planiranje i evropske integracije' },
  ];

  let kreiran = 0;
  for (const z of zaposlenici) {
    const user = new User({
      name: z.name,
      email: z.email.toLowerCase(),
      role: ['user'],
    });
    await user.setPassword('Fmeri2026!');
    await user.save();
    kreiran++;
  }

  console.log(`✅ Kreirano ${kreiran} korisnika`);
  console.log('Defaultna lozinka: Fmeri2026!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Greška:', err);
  process.exit(1);
});
