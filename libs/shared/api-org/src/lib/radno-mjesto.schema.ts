import { Document, Schema, Model, model, Types } from 'mongoose';

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

export type StatusSluzbenika = 'drzavni_sluzbenikili' | 'namjestenik' | 'rukovodeci';

export interface IRadnoMjesto extends Document {
  naziv: string;
  pozicija: PozicijaRadnogMjesta;
  organizacionaJedinica: Types.ObjectId;
  statusSluzbenika: StatusSluzbenika;
  nivo: number;
  opsisPoslova?: string;
  brojIzvrsilaca: number;
  aktivno: boolean;
}

const radnoMjestoSchema = new Schema<IRadnoMjesto>(
  {
    naziv: {
      type: String,
      required: [true, 'Naziv radnog mjesta je obavezan'],
      trim: true,
    },
    pozicija: {
      type: String,
      enum: [
        'ministar',
        'sekretar',
        'pomocnik_ministra',
        'savjetnik_ministra',
        'direktor',
        'pomocnik_direktora',
        'sef_odsjeka',
        'sef_grupe',
        'strucni_savjetnik',
        'visi_strucni_saradnik',
        'strucni_saradnik',
        'visi_referent',
        'referent',
        'vozac',
        'ostalo',
      ],
      required: [true, 'Pozicija je obavezna'],
    },
    organizacionaJedinica: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizacionaJedinica',
      required: [true, 'Organizaciona jedinica je obavezna'],
    },
    statusSluzbenika: {
      type: String,
      enum: ['drzavni_sluzbenikili', 'namjestenik', 'rukovodeci'],
      required: true,
    },
    nivo: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      // 1=ministar, 2=sekretar/pomocnik, 3=direktor,
      // 4=sef odsjeka, 5=savjetnik, 6=visi saradnik,
      // 7=saradnik, 8=visi referent, 9=referent, 10=ostalo
    },
    opsisPoslova: {
      type: String,
      trim: true,
    },
    brojIzvrsilaca: {
      type: Number,
      default: 1,
      min: 1,
    },
    aktivno: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

radnoMjestoSchema.index({ organizacionaJedinica: 1 });
radnoMjestoSchema.index({ pozicija: 1 });
radnoMjestoSchema.index({ nivo: 1 });

export const RadnoMjesto: Model<IRadnoMjesto> = model<IRadnoMjesto>(
  'RadnoMjesto',
  radnoMjestoSchema
);
