import { Document, Schema, Model, model, Types } from 'mongoose';

export interface ITable extends Document {
  tableNumber: string;
  positionX: number; // Pozicija na tlocrtu (npr. u pixelima ili %)
  positionY: number;
  capacity: number;
  shape: 'krug' | 'kvadrat'
  status: 'slobodan' | 'zauzet' | 'rezervisan';
  currentOrder?: Types.ObjectId; // ID aktivne narudžbe
}

const tableSchema = new Schema<ITable>({
  tableNumber: { type: String, required: true, unique: true },
  positionX: { type: Number, default: 0 },
  positionY: { type: Number, default: 0 },
  capacity: { type: Number, default: 2 },
  shape: {
    type: String,
    enum: ['krug', 'kvadrat'],
    default: 'kvadrat'
  },
  status: {
    type: String,
    enum: ['slobodan', 'zauzet', 'rezervisan'],
    default: 'slobodan'
  },
  currentOrder: { type: Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

export const Table: Model<ITable> = model<ITable>('Table', tableSchema);
