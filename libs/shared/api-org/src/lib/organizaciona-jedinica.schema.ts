import { Document, Schema, Model, model, Types } from 'mongoose';

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

export type NivoJedinice = 'osnovna' | 'unutrasnja';

export interface IOrganizacionaJedinica extends Document {
  naziv: string;
  tip: TipJedinice;
  nadredjenaJedinica: Types.ObjectId | null;
  rukovodilac?: Types.ObjectId;
  opis?: string;
  nadleznost?: string; // ← novo
  zakonskiOsnov?: string[]; // ← novo
  organ: Types.ObjectId; // ← novo — veza na Organ
  nivoJedinice: NivoJedinice; // ← novo
  aktivna: boolean;
  redoslijed: number;
  uSastavu: boolean; // ← ovo je bilo ranije
}

const organizacionaJedinicaSchema = new Schema<IOrganizacionaJedinica>(
  {
    naziv: {
      type: String,
      required: [true, 'Naziv je obavezan'],
      trim: true,
    },
    tip: {
      type: String,
      enum: [
        'ministarstvo',
        'kabinet',
        'zavod',
        'direkcija',
        'sektor',
        'sluzba',
        'odsjek',
        'grupa',
        'centar',
      ],
      required: [true, 'Tip jedinice je obavezan'],
    },
    nadredjenaJedinica: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizacionaJedinica',
      default: null,
    },
    rukovodilac: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    opis: {
      type: String,
      trim: true,
    },
    nadleznost: {
      type: String,
      trim: true,
    },
    zakonskiOsnov: [
      {
        type: String,
        trim: true,
      },
    ],
    organ: {
      type: Schema.Types.ObjectId,
      ref: 'Organ',
      required: false,
      default: null,
    },
    nivoJedinice: {
      type: String,
      enum: ['osnovna', 'unutrasnja'],
      default: 'osnovna',
    },
    aktivna: {
      type: Boolean,
      default: true,
    },
    redoslijed: {
      type: Number,
      default: 0,
    },
    uSastavu: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Indeksi za brže upite
organizacionaJedinicaSchema.index({ nadredjenaJedinica: 1 });
organizacionaJedinicaSchema.index({ tip: 1 });
organizacionaJedinicaSchema.index({ aktivna: 1 });

export const OrganizacionaJedinica: Model<IOrganizacionaJedinica> =
  model<IOrganizacionaJedinica>(
    'OrganizacionaJedinica',
    organizacionaJedinicaSchema,
  );
