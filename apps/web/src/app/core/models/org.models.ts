export type TipJedinice =
  | 'ministarstvo'
  | 'kabinet'
  | 'zavod'
  | 'direkcija'
  | 'sektor'
  | 'odsjek'
  | 'grupa'
  | 'centar';

export type PozicijaRadnogMjesta =
  | 'ministar'
  | 'sekretar'
  | 'pomocnik_ministra'
  | 'savjetnik_ministra'
  | 'direktor'
  | 'pomocnik_direktora'
  | 'sef_odsjeka'
  | 'sef_grupe'
  | 'strucni_savjetnik'
  | 'visi_strucni_saradnik'
  | 'strucni_saradnik'
  | 'visi_referent'
  | 'referent'
  | 'vozac'
  | 'ostalo';

export type StatusSluzbenika =
  | 'drzavni_sluzbenikili'
  | 'namjestenik'
  | 'rukovodeci';

export interface OrganizacionaJedinica {
  _id: string;
  naziv: string;
  tip: TipJedinice;
  nadredjenaJedinica: OrganizacionaJedinica | null;
  rukovodilac?: { _id: string; name: string; email: string };
  opis?: string;
  aktivna: boolean;
  redoslijed: number;
  djeca?: OrganizacionaJedinica[];
}

export interface RadnoMjesto {
  _id: string;
  naziv: string;
  pozicija: PozicijaRadnogMjesta;
  organizacionaJedinica: OrganizacionaJedinica;
  statusSluzbenika: StatusSluzbenika;
  nivo: number;
  opsisPoslova?: string;
  brojIzvrsilaca: number;
  aktivno: boolean;
}

export const TIP_JEDINICE_NAZIV: Record<TipJedinice, string> = {
  ministarstvo: 'Ministarstvo',
  kabinet: 'Kabinet',
  zavod: 'Zavod',
  direkcija: 'Direkcija',
  sektor: 'Sektor',
  odsjek: 'Odsjek',
  grupa: 'Grupa',
  centar: 'Centar',
};

export const POZICIJA_NAZIV: Record<PozicijaRadnogMjesta, string> = {
  ministar: 'Ministar',
  sekretar: 'Sekretar',
  pomocnik_ministra: 'Pomoćnik ministra',
  savjetnik_ministra: 'Savjetnik ministra',
  direktor: 'Direktor',
  pomocnik_direktora: 'Pomoćnik direktora',
  sef_odsjeka: 'Šef odsjeka',
  sef_grupe: 'Šef grupe',
  strucni_savjetnik: 'Stručni savjetnik',
  visi_strucni_saradnik: 'Viši stručni saradnik',
  strucni_saradnik: 'Stručni saradnik',
  visi_referent: 'Viši referent',
  referent: 'Referent',
  vozac: 'Vozač',
  ostalo: 'Ostalo',
};

export const STATUS_NAZIV: Record<StatusSluzbenika, string> = {
  drzavni_sluzbenikili: 'Državni službenik',
  namjestenik: 'Namještenik',
  rukovodeci: 'Rukovodeći',
};

// DTO tipovi za slanje na API (ID-ovi umjesto objekata)
export interface OrganizacionaJedinicaDTO {
  naziv: string;
  tip: TipJedinice;
  nadredjenaJedinica: string | null;
  opis?: string;
  redoslijed?: number;
}

export interface RadnoMjestoDTO {
  naziv: string;
  organizacionaJedinica: string;
  kategorijaZaposlenog: KategorijaZaposlenog;
  pozicijaKljuc: string;
  platniRazred: string;
  koeficijent: number;
  opsisPoslova?: string;
  posebniUvjeti?: string[];
  brojIzvrsilaca: number;
}

export type KategorijaZaposlenog =
  | 'rukovodeci_drzavni_sluzbenik'
  | 'ostali_drzavni_sluzbenik'
  | 'namjestenik';

export const KATEGORIJA_NAZIV: Record<KategorijaZaposlenog, string> = {
  rukovodeci_drzavni_sluzbenik: 'Rukovodeći državni službenik',
  ostali_drzavni_sluzbenik: 'Državni službenik',
  namjestenik: 'Namještenik',
};

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

export interface RadnoMjesto {
  _id: string;
  naziv: string;
  organizacionaJedinica: OrganizacionaJedinica;
  kategorijaZaposlenog: KategorijaZaposlenog;
  pozicijaKljuc: string;
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
  pozicijaKljuc: string;
  platniRazred: string;
  koeficijent: number;
  opsisPoslova?: string;
  posebniUvjeti?: string[];
  brojIzvrsilaca: number;
}

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

export interface UserProfil {
  _id: string;
  name: string;
  email: string;
  role: string[];
  slika?: string;
  organizacionaJedinica?: {
    _id: string;
    naziv: string;
    tipJedinice: string;
  };
  radnoMjesto?: {
    _id: string;
    naziv: string;
    pozicijaKljuc: string;
    platniRazred: string;
    koeficijent: number;
  };
}

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