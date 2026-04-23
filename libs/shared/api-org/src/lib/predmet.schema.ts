import { Schema, model, Document, Types } from 'mongoose';

export type PrioritetPredmeta = 'redovno' | 'vazno' | 'urgentno';

export type UlogaAkta =
  | 'osnovni'
  | 'zavrsni'
  | 'prilog'
  | 'zahtjev_za_misljenje'
  | 'misljenje'
  | 'obavijest'
  | 'ostalo';

export type VrstAkta =
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

export type SmjerAkta = 'ulazni' | 'izlazni';

export type StatusPredmeta = 'u_radu' | 'rijeseno' | 'arhivirano';

export interface IAkt {
  brojAkta?: string;
  naziv: string;
  opis?: string;
  vrsta: VrstAkta;
  uloga: UlogaAkta; // ← dodaj
  smjer: SmjerAkta;
  datum: Date;
  posiljilac?: string;
  fajl?: {
    putanja: string;
    originalniNaziv: string;
    mimetype: string;
    velicina: number;
  };
}

export interface IPredmet extends Document {
  brojPredmeta: string;
  naziv: string;
  opis?: string;
  prioritet: PrioritetPredmeta; // ← dodaj
  organ: Types.ObjectId;
  organizacionaJedinica?: Types.ObjectId;
  referent: Types.ObjectId;
  status: StatusPredmeta;
  datumOtvaranja: Date;
  datumArhiviranja?: Date;
  akti: Types.DocumentArray<IAkt & Document>;
  aktivan: boolean;
}

const aktSchema = new Schema<IAkt>(
  {
    brojAkta: { type: String, trim: true },
    naziv: { type: String, required: true, trim: true },
    opis: { type: String, trim: true },
    vrsta: {
      type: String,
      enum: [
        'zahtjev',
        'rjesenje',
        'dopis',
        'odluka',
        'ugovor',
        'izvjestaj',
        'zakljucak',
        'zapisnik',
        'obavijest',
        'suglasnost',
        'ostalo',
      ],
      required: true,
    },
    uloga: {
      type: String,
      enum: [
        'osnovni',
        'zavrsni',
        'prilog',
        'zahtjev_za_misljenje',
        'misljenje',
        'obavijest',
        'ostalo',
      ],
      default: 'ostalo',
    },
    smjer: {
      type: String,
      enum: ['ulazni', 'izlazni'],
      required: true,
    },
    datum: { type: Date, required: true },
    posiljilac: { type: String, trim: true },
    fajl: {
      putanja: { type: String },
      originalniNaziv: { type: String },
      mimetype: { type: String },
      velicina: { type: Number },
    },
  },
  { timestamps: true },
);

const predmetSchema = new Schema<IPredmet>(
  {
    brojPredmeta: {
      type: String,
      required: [true, 'Broj predmeta je obavezan'],
      trim: true,
    },
    naziv: {
      type: String,
      required: [true, 'Naziv predmeta je obavezan'],
      trim: true,
    },
    opis: { type: String, trim: true },
    prioritet: {
      type: String,
      enum: ['redovno', 'vazno', 'urgentno'],
      default: 'redovno',
    },
    organ: {
      type: Schema.Types.ObjectId,
      ref: 'Organ',
      required: true,
    },
    organizacionaJedinica: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizacionaJedinica',
    },
    referent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['u_radu', 'rijeseno', 'arhivirano'],
      default: 'u_radu',
    },
    datumOtvaranja: {
      type: Date,
      default: Date.now,
    },
    datumArhiviranja: { type: Date },
    akti: [aktSchema],
    aktivan: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Predmet = model<IPredmet>('Predmet', predmetSchema);
