import { Document, Schema, Model, model } from 'mongoose';

export type KategorijaReferentnihPodataka =
  | 'drzavni_sluzbenik'
  | 'namjestenik'
  | 'izabrani_duznosnik'
  | 'sudska_policija';

export type TipReferentnihPodataka = 'platni_razredi';

export interface IUvjetiKonkursa {
  stucnaSprema: 'VSS' | 'VŠS' | 'SSS' | 'VKV' | 'KV' | 'NK';
  bolonja?: string[];
  minRadnoIskustvo: number;
  stucniIspit: boolean;
  posebniUvjeti: string[];
  opciUvjeti?: string[];
}

export interface IRadnoVrijeme {
  satniSedmicno: number;
  godisnjiOdmor: number | { min: number; max: number };
  placeniDopust: number;
  probniRad?: number;
}

export interface IDodaci {
  povecanjePlazeOcjena?: {
    narocitoUspjesan?: { min: number; max: number };
    uspjesan?: { min: number; max: number };
  };
  naZnanje?: boolean;
  maxPosebniUvjeti: number;
  maxRadniStaz: number;
}

export interface IPozicija {
  kljuc: string;
  naziv: string;
  naziv_alternativni: string[];
  opis: string;
  pravniOsnov: string;
  kategorija: string;
  vrstaPoslova?: string;
  uvjetiKonkursa: IUvjetiKonkursa;
  radnoVrijeme: IRadnoVrijeme;
  odgovornost: {
    odgovaraKome: string;
    rukovodiCime: string | null;
  };
  dodaci: IDodaci;
}

export interface IPlatniRazred {
  razred: string;
  koeficijent: number;
  pozicije: IPozicija[];
}

export interface IZakon {
  naziv: string;
  clan: string;
  verzija: string;
  datumPrimjene: string;
  izmjene: {
    broj: string;
    datum: string;
    opis: string;
  }[];
  prateciZakon?: {
    naziv: string;
    broj: string;
    izmjene: string[];
  };
  aktivno: boolean;
}

export interface IObracunPlace {
  formula: string;
  osnovica?: string;
  maxUvecanjePoBodu?: number;
  minPlacaPostotak?: number;
  minPlacaOsnov?: string;
  povecanjePlazeOcjena?: {
    narocitoUspjesan?: { min: number; max: number };
    uspjesan?: { min: number; max: number };
  };
}

export interface IReferentniPodaci extends Document {
  tip: TipReferentnihPodataka;
  kategorija: KategorijaReferentnihPodataka;
  zakon: IZakon;
  podaci: IPlatniRazred[];
  obracunPlace: IObracunPlace;
}

const uvjetiKonkursaSchema = new Schema<IUvjetiKonkursa>({
  stucnaSprema: { type: String, required: true },
  bolonja: [{ type: String }],
  minRadnoIskustvo: { type: Number, required: true },
  stucniIspit: { type: Boolean, required: true },
  posebniUvjeti: [{ type: String }],
  opciUvjeti: [{ type: String }],
}, { _id: false });

const pozicijaSchema = new Schema<IPozicija>({
  kljuc: { type: String, required: true },
  naziv: { type: String, required: true },
  naziv_alternativni: [{ type: String }],
  opis: { type: String, required: true },
  pravniOsnov: { type: String, required: true },
  kategorija: { type: String, required: true },
  vrstaPoslova: { type: String },
  uvjetiKonkursa: { type: uvjetiKonkursaSchema, required: true },
  radnoVrijeme: { type: Schema.Types.Mixed, required: true },
  odgovornost: {
    odgovaraKome: { type: String, required: true },
    rukovodiCime: { type: String, default: null },
  },
  dodaci: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const platniRazredSchema = new Schema<IPlatniRazred>({
  razred: { type: String, required: true },
  koeficijent: { type: Number, required: true },
  pozicije: [pozicijaSchema],
}, { _id: false });

const zakonSchema = new Schema<IZakon>({
  naziv: { type: String, required: true },
  clan: { type: String, required: true },
  verzija: { type: String, required: true },
  datumPrimjene: { type: String, required: true },
  izmjene: [{
    broj: String,
    datum: String,
    opis: String,
  }],
  prateciZakon: {
    naziv: String,
    broj: String,
    izmjene: [String],
  },
  aktivno: { type: Boolean, default: true },
}, { _id: false });

const referentniPodaciSchema = new Schema<IReferentniPodaci>(
  {
    tip: {
      type: String,
      enum: ['platni_razredi'],
      required: true,
    },
    kategorija: {
      type: String,
      enum: ['drzavni_sluzbenik', 'namjestenik', 'izabrani_duznosnik', 'sudska_policija'],
      required: true,
    },
    zakon: { type: zakonSchema, required: true },
    podaci: [platniRazredSchema],
    obracunPlace: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

referentniPodaciSchema.index({ tip: 1, kategorija: 1 }, { unique: true });

export const ReferentniPodaci: Model<IReferentniPodaci> =
  model<IReferentniPodaci>('ReferentniPodaci', referentniPodaciSchema);
