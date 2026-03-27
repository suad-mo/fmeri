import { Document, Schema, Model, model } from 'mongoose';
import { TipJedinice } from '@nx-fmeri/api-org';

export interface IJedinicaSablon {
  tip: TipJedinice;
  naziv: string;
  obavezna: boolean;
  minBroj: number;
  maxBroj: number | null;        // null = neograničeno
  roditeljTipovi: TipJedinice[]; // u kojim osnovnim jedinicama može biti
}

export interface IGlobalniSablon extends Document {
  tipOrgana: TipJedinice;
  naziv: string;
  pravniOsnov: string;
  opis?: string;
  osnovneJedinice: IJedinicaSablon[];
  unutrasnjeJedinice: IJedinicaSablon[];
  aktivno: boolean;
}

const jedinicaSablonSchema = new Schema<IJedinicaSablon>({
  tip: { type: String, required: true },
  naziv: { type: String, required: true },
  obavezna: { type: Boolean, default: false },
  minBroj: { type: Number, default: 0 },
  maxBroj: { type: Number, default: null },
  roditeljTipovi: [{ type: String }],
}, { _id: false });

const globalniSablonSchema = new Schema<IGlobalniSablon>(
  {
    tipOrgana: {
      type: String,
      required: true,
      unique: true,
    },
    naziv: {
      type: String,
      required: true,
    },
    pravniOsnov: {
      type: String,
      required: true,
    },
    opis: { type: String },
    osnovneJedinice: [jedinicaSablonSchema],
    unutrasnjeJedinice: [jedinicaSablonSchema],
    aktivno: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// globalniSablonSchema.index({ tipOrgana: 1 }, { unique: true });

export const GlobalniSablon: Model<IGlobalniSablon> =
  model<IGlobalniSablon>('GlobalniSablon', globalniSablonSchema);
