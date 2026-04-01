import { Document, Schema, Model, model, Types } from 'mongoose';

export type VrstaOrgana =
  | 'ministarstvo' // Čl. 17 Zakona o organizaciji organa uprave FBiH
  | 'uprava' // Čl. 18
  | 'upravna_organizacija' // Čl. 19 — Zavod, Direkcija
  | 'ustanova'; // Čl. 20

export interface IOrgan extends Document {
  naziv: string;
  vrstaOrgana: VrstaOrgana;
  skraceniNaziv?: string;
  nadleznost?: string;
  opis?: string;
  zakonskiOsnov?: string[];
  uSastavu: boolean;
  nadredjeniOrgan?: Types.ObjectId;
  aktivan: boolean;
  redoslijed: number;
}

const organSchema = new Schema<IOrgan>(
  {
    naziv: {
      type: String,
      required: [true, 'Naziv je obavezan'],
      trim: true,
    },
    vrstaOrgana: {
      type: String,
      enum: ['ministarstvo', 'uprava', 'upravna_organizacija', 'ustanova'],
      required: [true, 'Vrsta organa je obavezna'],
    },
    skraceniNaziv: {
      type: String,
      trim: true,
    },
    nadleznost: {
      type: String,
      trim: true,
    },
    opis: {
      type: String,
      trim: true,
    },
    zakonskiOsnov: [
      {
        type: String,
        trim: true,
      },
    ],
    uSastavu: {
      type: Boolean,
      default: false,
    },
    nadredjeniOrgan: {
      type: Schema.Types.ObjectId,
      ref: 'Organ',
      default: null,
    },
    aktivan: {
      type: Boolean,
      default: true,
    },
    redoslijed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

organSchema.index({ vrstaOrgana: 1 });
organSchema.index({ uSastavu: 1 });
organSchema.index({ nadredjeniOrgan: 1 });
organSchema.index({ aktivan: 1 });

export const Organ: Model<IOrgan> = model<IOrgan>('Organ', organSchema);
