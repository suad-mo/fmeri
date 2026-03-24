import { Document, Schema, Model, model, Types } from 'mongoose';

export type TipJedinice =
  | 'ministarstvo'
  | 'kabinet'
  | 'upravna_organizacija'
  | 'sektor'
  | 'odsjek'
  | 'grupa'
  | 'centar';

export interface IOrganizacionaJedinica extends Document {
  naziv: string;
  tip: TipJedinice;
  nadredjenaJedinica: Types.ObjectId | null;
  rukovodilac?: Types.ObjectId;
  opis?: string;
  aktivna: boolean;
  redoslijed: number;
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
        'upravna_organizacija',
        'sektor',
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
    aktivna: {
      type: Boolean,
      default: true,
    },
    redoslijed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indeksi za brže upite
organizacionaJedinicaSchema.index({ nadredjenaJedinica: 1 });
organizacionaJedinicaSchema.index({ tip: 1 });
organizacionaJedinicaSchema.index({ aktivna: 1 });

export const OrganizacionaJedinica: Model<IOrganizacionaJedinica> =
  model<IOrganizacionaJedinica>(
    'OrganizacionaJedinica',
    organizacionaJedinicaSchema
  );
