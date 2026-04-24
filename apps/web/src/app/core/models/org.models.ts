// ── Organizaciona jedinica ────────────────────────────
export type TipJedinice =
  | 'ministarstvo'
  | 'kabinet'
  | 'zavod'
  | 'direkcija'
  | 'sektor'
  | 'sluzba' // ← dodaj
  | 'odsjek'
  | 'grupa'
  | 'centar';

export const TIP_JEDINICE_NAZIV: Record<TipJedinice, string> = {
  ministarstvo: 'Ministarstvo',
  kabinet: 'Kabinet',
  zavod: 'Zavod',
  direkcija: 'Direkcija',
  sektor: 'Sektor',
  sluzba: 'Služba',
  odsjek: 'Odsjek',
  grupa: 'Grupa',
  centar: 'Centar',
};

export interface OrganizacionaJedinica {
  _id: string;
  naziv: string;
  tip: TipJedinice;
  nadredjenaJedinica: OrganizacionaJedinica | null;
  rukovodilac?: { _id: string; name: string; email: string };
  opis?: string;
  aktivna: boolean;
  redoslijed: number;
  uSastavu: boolean; // ← novo
  djeca?: OrganizacionaJedinica[];
}

export interface OrganizacionaJedinicaDTO {
  naziv: string;
  tip: TipJedinice;
  nadredjenaJedinica: string | null;
  opis?: string;
  redoslijed?: number;
}

// ── Kategorije i pozicije — direktno iz zakona ─────────
export type KategorijaZaposlenog =
  | 'izabrani_duznosnik' // Član 9. Zakon o plaćama
  | 'rukovodeci_drzavni_sluzbenik' // Član 6a ZDS
  | 'ostali_drzavni_sluzbenik' // Član 6b ZDS
  | 'namjestenik'; // Zakon o namještenicima

export const KATEGORIJA_NAZIV: Record<KategorijaZaposlenog, string> = {
  izabrani_duznosnik: 'Izabrani dužnosnik',
  rukovodeci_drzavni_sluzbenik: 'Rukovodeći državni službenik',
  ostali_drzavni_sluzbenik: 'Državni službenik',
  namjestenik: 'Namještenik',
};

export type PozicijaKljuc =
  // Izabrani dužnosnici
  | 'ministar'
  | 'savjetnik_ministra'
  // Rukovodeći državni službenici
  | 'sekretar_vlade'
  | 'rukovodilac_samostalne_uprave'
  | 'sekretar_organa'
  | 'pomocnik_rukovodioca'
  | 'sekretar_upravne_organizacije'
  | 'rukovodilac_u_sastavu'
  | 'glavni_inspektor'
  | 'pomocnik_u_sastavu'
  | 'sef_kabineta_zamjenika'
  | 'sef_kabineta_rukovodioca'
  | 'rukovodilac_osnovne_jedinice'
  // Ostali državni službenici
  | 'sef_unutrasnje_jedinice'
  | 'inspektor'
  | 'strucni_savjetnik'
  | 'visi_strucni_saradnik'
  | 'strucni_saradnik'
  // Namještenici
  | 'sef_unutrasnje_jedinice_vss'
  | 'visi_samostalni_referent'
  | 'samostalni_referent'
  | 'sef_unutrasnje_jedinice_sss'
  | 'visi_referent'
  | 'referent'
  | 'pomocni_radnik'
  // Posebni
  | 'ostalo';

// ── Radno mjesto ──────────────────────────────────────
export interface RadnoMjesto {
  _id: string;
  naziv: string;
  organizacionaJedinica: OrganizacionaJedinica;
  kategorijaZaposlenog: KategorijaZaposlenog;
  pozicijaKljuc: PozicijaKljuc;
  platniRazred: string;
  koeficijent: number;
  opsisPoslova?: string;
  posebniUvjeti?: string[];
  dodatakPosebniUvjeti?: {
    procenat: number;
    osnov: string;
  };
  brojIzvrsilaca: number;
  aktivno: boolean;
}

export interface RadnoMjestoDTO {
  naziv: string;
  organizacionaJedinica: string;
  kategorijaZaposlenog: KategorijaZaposlenog;
  pozicijaKljuc: PozicijaKljuc;
  platniRazred: string;
  koeficijent: number;
  opsisPoslova?: string;
  posebniUvjeti?: string[];
  brojIzvrsilaca: number;
  [key: string]: unknown; // ← dodaj
}

// ── Referentni podaci ─────────────────────────────────
export interface PlatniRazredPozicija {
  kljuc: string;
  naziv: string;
  naziv_alternativni: string[];
  opis: string;
  kategorija: string;
  razred: string;
  koeficijent: number;
  uvjetiKonkursa: {
    stucnaSprema: string;
    minRadnoIskustvo: number;
    stucniIspit: boolean;
    posebniUvjeti: string[];
  };
}

// ── Šabloni ───────────────────────────────────────────
export interface JedinicaSablon {
  tip: TipJedinice;
  naziv: string;
  obavezna: boolean;
  minBroj: number;
  maxBroj: number | null;
  roditeljTipovi: TipJedinice[];
}

export interface GlobalniSablon {
  _id: string;
  tipOrgana: TipJedinice;
  naziv: string;
  pravniOsnov: string;
  opis?: string;
  osnovneJedinice: JedinicaSablon[];
  unutrasnjeJedinice: JedinicaSablon[];
  aktivno: boolean;
}

// ── Korisnici ─────────────────────────────────────────
export interface UserProfil {
  _id: string;
  name: string;
  email: string;
  role: string[];
  slika?: string;
  zaposlenik?: {
    _id: string;
    ime: string;
    prezime: string;
  } | null;
}

// ── Dashboard / Statistike ────────────────────────────
export interface DashboardStats {
  ukupnoZaposlenika: number;
  ukupnoJedinica: number;
  ukupnoRadnihMjesta: number;
  zaposleniciSaRadnimMjestom: number;
  zaposleniciSaDodjeljenim: number;
}

export interface PlatniRazredStat {
  razred: string;
  kategorija: string;
  broj: number;
  koeficijent: number;
}

export interface SistematizacijaItem {
  _id: string;
  naziv: string;
  organizacionaJedinica: { _id: string; naziv: string };
  pozicijaKljuc: string;
  platniRazred: string;
  koeficijent: number;
  kategorijaZaposlenog: string;
  brojIzvrsilaca: number;
  popunjeno: number;
  slobodna: number;
  status: 'popunjeno' | 'djelimicno' | 'slobodno';
}

// ── Org. jedinica detalji ─────────────────────────────
export interface RadnoMjestoDetalji {
  _id: string;
  naziv: string;
  organizacionaJedinica?: { _id: string; naziv: string } | string;
  kategorijaZaposlenog: KategorijaZaposlenog;
  pozicijaKljuc: PozicijaKljuc;
  platniRazred: string;
  koeficijent: number;
  opsisPoslova?: string;
  posebniUvjeti?: string[];
  brojIzvrsilaca: number;
  zaposlenici: {
    // ← dodaj
    _id: string;
    ime: string;
    prezime: string;
    sluzbeniEmail?: string;
    slika?: string;
  }[];
  useri: {
    _id: string;
    name: string;
    email: string;
    slika?: string;
  }[];
}

export interface JedinicaDetalji {
  jedinica: OrganizacionaJedinica;
  radnaMjesta: RadnoMjestoDetalji[];
  ukupnoMjesta: number;
  popunjeno: number;
}

// ── Organ ─────────────────────────────────────────────
export type VrstaOrgana =
  | 'ministarstvo'
  | 'uprava'
  | 'upravna_organizacija'
  | 'ustanova';

export const VRSTA_ORGANA_NAZIV: Record<VrstaOrgana, string> = {
  ministarstvo: 'Ministarstvo',
  uprava: 'Uprava',
  upravna_organizacija: 'Upravna organizacija',
  ustanova: 'Ustanova',
};

export interface Organ {
  _id: string;
  naziv: string;
  skraceniNaziv?: string;
  vrstaOrgana: VrstaOrgana;
  nadleznost?: string;
  opis?: string;
  zakonskiOsnov?: string[];
  uSastavu: boolean;
  nadredjeniOrgan?: { _id: string; naziv: string; skraceniNaziv?: string };
  aktivan: boolean;
  redoslijed: number;
}

export interface OsnovnaJedinicaDetalji extends OrganizacionaJedinica {
  radnaMjesta: RadnoMjestoDetalji[];
  unutrasnje: UnutrasnjaJedinicaDetalji[];
}

export interface UnutrasnjaJedinicaDetalji extends OrganizacionaJedinica {
  radnaMjesta: RadnoMjestoDetalji[];
}

export interface OrganStruktura {
  organ: Organ;
  radnaMjesta: RadnoMjestoDetalji[];
  zaposleniciUOrganu: {
    // ← dodaj
    _id: string;
    ime: string;
    prezime: string;
    sluzbeniEmail?: string;
    slika?: string;
    radnoMjesto?: string;
  }[];
  osnovneJedinice: OsnovnaJedinicaDetalji[];
}

// ── Zaposlenik ────────────────────────────────────────
export type VrstaUgovora =
  | 'neodredjeno'
  | 'odredjeno'
  | 'pripravnik'
  | 'volonter';

export const VRSTA_UGOVORA_NAZIV: Record<VrstaUgovora, string> = {
  neodredjeno: 'Neodređeno',
  odredjeno: 'Određeno',
  pripravnik: 'Pripravnik',
  volonter: 'Volonter',
};

export interface Zaposlenik {
  _id: string;
  ime: string;
  prezime: string;
  jmbg?: string;
  datumRodjenja?: string;
  spol?: 'M' | 'Z';
  sluzbeniEmail?: string;
  privatniEmail?: string;
  telefon?: string;
  mobilni?: string;
  adresa?: string;
  organ?: { _id: string; naziv: string; skraceniNaziv?: string };
  organizacionaJedinica?: { _id: string; naziv: string; tip: string };
  radnoMjesto?: {
    _id: string;
    naziv: string;
    pozicijaKljuc: string;
    platniRazred: string;
    koeficijent: number;
    kategorijaZaposlenog: string;
  };
  datumZaposlenja?: string;
  vrstaUgovora?: VrstaUgovora;
  slika?: string;
  user?: { _id: string; email: string; role: string[] };
  aktivan: boolean;
}

export interface ZaposlenikDTO {
  ime: string;
  prezime: string;
  jmbg?: string;
  datumRodjenja?: string;
  spol?: 'M' | 'Z';
  sluzbeniEmail?: string;
  privatniEmail?: string;
  telefon?: string;
  mobilni?: string;
  adresa?: string;
  organ?: string;
  organizacionaJedinica?: string;
  radnoMjesto?: string;
  datumZaposlenja?: string;
  vrstaUgovora?: VrstaUgovora;
}

// U org.models.ts dodaj interface
export interface PopunjenostJedinice {
  jedinicaId: string;
  naziv: string;
  tip: string;
  nivoJedinice: string;
  ukupnoRM: number;
  popunjeno: number;
  upraznjeno: number;
  posto: number;
}

export interface PopunjenostOrgana {
  organId: string;
  naziv: string;
  skraceniNaziv?: string;
  vrstaOrgana: string;
  ukupnoRM: number;
  popunjeno: number;
  upraznjeno: number;
  posto: number;
  poJedinicama: PopunjenostJedinice[];
}

// org.models.ts
export interface PregledRM {
  _id: string;
  naziv: string;
  kategorijaZaposlenog: KategorijaZaposlenog;
  platniRazred: string;
  koeficijent: number;
  brojIzvrsilaca: number;
  popunjeno: number;
  upraznjeno: number;
  status: 'popunjeno' | 'djelimicno' | 'slobodno';
}

export interface PregledUOJ {
  _id: string;
  naziv: string;
  tip: string;
  radnaMjesta: PregledRM[];
  ukupnoRM: number;
  popunjeno: number;
  upraznjeno: number;
  posto: number;
}

export interface PregledOOJ {
  _id: string;
  naziv: string;
  tip: string;
  direktnaRM: PregledRM[];
  unutrasnje: PregledUOJ[];
  ukupnoRM: number;
  popunjeno: number;
  upraznjeno: number;
  posto: number;
}

export interface PregledOrgana {
  organId: string;
  naziv: string;
  skraceniNaziv?: string;
  vrstaOrgana: string;
  direktnaRM: PregledRM[];
  osnovneJedinice: PregledOOJ[];
  ukupnoRM: number;
  popunjeno: number;
  upraznjeno: number;
  posto: number;
}

export type PrioritetPredmeta = 'redovno' | 'vazno' | 'urgentno';

export type UlogaAkta =
  | 'osnovni'
  | 'zavrsni'
  | 'prilog'
  | 'zahtjev_za_misljenje'
  | 'misljenje'
  | 'obavijest'
  | 'ostalo';

export type VrstaAkta =
  | 'zahtjev'
  | 'rjesenje'
  | 'dopis'
  | 'odluka'
  | 'ugovor'
  | 'izvjestaj'
  | 'zakljucak'
  | 'zapisnik'
  | 'obavijest'
  | 'suglasnost'
  | 'ostalo';

export const PRIORITET_PREDMETA: Record<PrioritetPredmeta, string> = {
  redovno: 'Redovno',
  vazno: 'Važno',
  urgentno: 'Urgentno',
};

export const ULOGA_AKTA: Record<UlogaAkta, string> = {
  osnovni: 'Osnovni',
  zavrsni: 'Završni',
  prilog: 'Prilog',
  zahtjev_za_misljenje: 'Zahtjev za mišljenje',
  misljenje: 'Mišljenje',
  obavijest: 'Obavijest',
  ostalo: 'Ostalo',
};

export const VRSTA_AKTA: Record<VrstaAkta, string> = {
  zahtjev: 'Zahtjev',
  rjesenje: 'Rješenje',
  dopis: 'Dopis',
  odluka: 'Odluka',
  ugovor: 'Ugovor',
  izvjestaj: 'Izvještaj',
  zakljucak: 'Zaključak',
  zapisnik: 'Zapisnik',
  obavijest: 'Obavijest',
  suglasnost: 'Suglasnost',
  ostalo: 'Ostalo',
};

export type SmjerAkta = 'ulazni' | 'izlazni';

export type StatusPredmeta = 'u_radu' | 'rijeseno' | 'arhivirano';

export interface IAkt {
  _id: string;
  brojAkta?: string;
  naziv: string;
  opis?: string;
  vrsta: VrstaAkta;
  uloga: UlogaAkta;
  smjer: SmjerAkta;
  datum: string;
  posiljilac?: string;
  fajlovi: {           // ← zamijeni fajl s fajlovi
    _id: string;
    putanja: string;
    originalniNaziv: string;
    mimetype: string;
    velicina: number;
  }[];
}

export interface IPredmet {
  _id: string;
  brojPredmeta: string;
  naziv: string;
  opis?: string;
  prioritet: PrioritetPredmeta;
  organ: { _id: string; naziv: string; skraceniNaziv?: string };
  organizacionaJedinica?: { _id: string; naziv: string };
  referent: { _id: string; name: string; email: string };
  status: StatusPredmeta;
  datumOtvaranja: string;
  datumArhiviranja?: string;
  akti: IAkt[];
  aktivan: boolean;
  createdAt: string;
}

export const STATUS_PREDMETA: Record<StatusPredmeta, string> = {
  u_radu: 'U radu',
  rijeseno: 'Riješeno',
  arhivirano: 'Arhivirano',
};

export const SMJER_AKTA: Record<SmjerAkta, string> = {
  ulazni: 'Ulazni',
  izlazni: 'Izlazni',
};
