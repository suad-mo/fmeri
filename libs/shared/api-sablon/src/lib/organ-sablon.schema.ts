import { Document, Schema, Model, model, Types } from 'mongoose';
import { TipJedinice } from '@nx-fmeri/api-org';

export interface IOverride {
  tip: TipJedinice;
  obavezna?: boolean;
  minBroj?: number;
  maxBroj?: number | null;
  aktivan?: boolean;             // false = isključiti iz globalnog
  napomena?: string;
}

export interface IOrganSablon extends Document {
  organ: Types.ObjectId;         // ref → OrganizacionaJedinica
  globalniSablon: Types.ObjectId; // ref → GlobalniSablon
  overrides: IOverride[];
  napomena?: string;             // specifičan pravni osnov za organ
  aktivno: boolean;
}

const overrideSchema = new Schema<IOverride>({
  tip: { type: String, required: true },
  obavezna: { type: Boolean },
  minBroj: { type: Number },
  maxBroj: { type: Number },
  aktivan: { type: Boolean },
  napomena: { type: String },
}, { _id: false });

const organSablonSchema = new Schema<IOrganSablon>(
  {
    organ: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizacionaJedinica',
      required: true,
      unique: true,
    },
    globalniSablon: {
      type: Schema.Types.ObjectId,
      ref: 'GlobalniSablon',
      required: true,
    },
    overrides: [overrideSchema],
    napomena: { type: String },
    aktivno: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// organSablonSchema.index({ organ: 1 }, { unique: true });

export const OrganSablon: Model<IOrganSablon> =
  model<IOrganSablon>('OrganSablon', organSablonSchema);
