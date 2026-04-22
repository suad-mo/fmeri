import { Document, Schema, Model, model, Types } from 'mongoose';

export interface IZaposlenik extends Document {
  ime: string;
  prezime: string;
  jmbg?: string;
  datumRodjenja?: Date;
  spol?: 'M' | 'Z';
  // Kontakt
  sluzbeniEmail?: string;
  privatniEmail?: string;
  telefon?: string;
  mobilni?: string;
  adresa?: string;
  // Org. struktura
  organ?: Types.ObjectId;
  organizacionaJedinica?: Types.ObjectId;
  radnoMjesto?: Types.ObjectId;
  // Zaposlenje
  datumZaposlenja?: Date;
  vrstaUgovora?: 'neodredjeno' | 'odredjeno' | 'pripravnik' | 'volonter';
  // Slika
  slika?: string;
  // Veza na User nalog
  user?: Types.ObjectId;
  // Status
  aktivan: boolean;
}

const zaposlenikSchema = new Schema<IZaposlenik>(
  {
    ime: {
      type: String,
      required: [true, 'Ime je obavezno'],
      trim: true,
    },
    prezime: {
      type: String,
      required: [true, 'Prezime je obavezno'],
      trim: true,
    },
    jmbg: {
      type: String,
      trim: true,
      sparse: true,
    },
    datumRodjenja: {
      type: Date,
    },
    spol: {
      type: String,
      enum: ['M', 'Z'],
    },
    sluzbeniEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    privatniEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    telefon: {
      type: String,
      trim: true,
    },
    mobilni: {
      type: String,
      trim: true,
    },
    adresa: {
      type: String,
      trim: true,
    },
    organ: {
      type: Schema.Types.ObjectId,
      ref: 'Organ',
      default: null,
    },
    organizacionaJedinica: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizacionaJedinica',
      default: null,
    },
    radnoMjesto: {
      type: Schema.Types.ObjectId,
      ref: 'RadnoMjesto',
      default: null,
    },
    datumZaposlenja: {
      type: Date,
    },
    vrstaUgovora: {
      type: String,
      enum: ['neodredjeno', 'odredjeno', 'pripravnik', 'volonter'],
      default: 'neodredjeno',
    },
    slika: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    aktivan: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

zaposlenikSchema.index({ organ: 1 });
zaposlenikSchema.index({ organizacionaJedinica: 1 });
zaposlenikSchema.index({ radnoMjesto: 1 });
zaposlenikSchema.index({ user: 1 });
zaposlenikSchema.index({ aktivan: 1 });
zaposlenikSchema.index({ prezime: 1, ime: 1 });

export const Zaposlenik: Model<IZaposlenik> =
  model<IZaposlenik>('Zaposlenik', zaposlenikSchema);
