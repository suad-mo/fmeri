export type TipJedinice =
  | 'ministarstvo'
  | 'kabinet'
  | 'upravna_organizacija'
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
  upravna_organizacija: 'Upravna organizacija',
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
  pozicija: PozicijaRadnogMjesta;
  organizacionaJedinica: string;
  statusSluzbenika: StatusSluzbenika;
  nivo: number;
  brojIzvrsilaca: number;
  opsisPoslova?: string;
}
