import { Document, Schema, Model, model, Types } from 'mongoose';

// Kategorije direktno iz zakona
export type KategorijaZaposlenog =
  | 'rukovodeci_drzavni_sluzbenik'  // Član 6a ZDS
  | 'ostali_drzavni_sluzbenik'       // Član 6b ZDS
  | 'namjestenik';                   // Zakon o namještenicima

// Ključevi pozicija iz referentnih podataka (api-ref)
export type PozicijaKljuc =
  // Rukovodeći državni službenici
  | 'sekretar_vlade'
  | 'rukovodilac_samostalne_uprave'
  | 'sekretar_organa'
  | 'pomocnik_rukovodioca'
  | 'sekretar_upravne_organizacije'
  | 'rukovodilac_u_sastavu'
  | 'glavni_inspektor'
  | 'pomocnik_u_sastavu'
  | 'sef_kabineta_zamjenika'
  | 'sef_kabineta_rukovodioca'
  | 'rukovodilac_osnovne_jedinice'
  // Ostali državni službenici
  | 'sef_unutrasnje_jedinice'
  | 'inspektor'
  | 'strucni_savjetnik'
  | 'visi_strucni_saradnik'
  | 'strucni_saradnik'
  // Namještenici
  | 'sef_unutrasnje_jedinice_vss'
  | 'visi_samostalni_referent'
  | 'samostalni_referent'
  | 'sef_unutrasnje_jedinice_sss'
  | 'visi_referent'
  | 'referent'
  | 'pomocni_radnik'
  // Posebni (van standardnih razreda)
  | 'ostalo';

export interface IRadnoMjesto extends Document {
  naziv: string;
  organizacionaJedinica: Types.ObjectId;

  // Klasifikacija po zakonu
  kategorijaZaposlenog: KategorijaZaposlenog;
  pozicijaKljuc: PozicijaKljuc;

  // Platni razred i koeficijent — preuzeti iz referentnih podataka
  platniRazred: string;
  koeficijent: number;

  // Opis poslova i uvjeti
  opsisPoslova?: string;
  posebniUvjeti?: string[];

  // Dodatak na plaću po posebnim uvjetima (Član 23. Zakon o plaćama)
  dodatakPosebniUvjeti?: {
    procenat: number;
    osnov: string;
  };

  // Sistematizacija
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
    organizacionaJedinica: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizacionaJedinica',
      required: [true, 'Organizaciona jedinica je obavezna'],
    },
    kategorijaZaposlenog: {
      type: String,
      enum: [
        'rukovodeci_drzavni_sluzbenik',
        'ostali_drzavni_sluzbenik',
        'namjestenik',
      ],
      required: [true, 'Kategorija zaposlenog je obavezna'],
    },
    pozicijaKljuc: {
      type: String,
      required: [true, 'Pozicija je obavezna'],
    },
    platniRazred: {
      type: String,
      required: [true, 'Platni razred je obavezan'],
    },
    koeficijent: {
      type: Number,
      required: [true, 'Koeficijent je obavezan'],
      min: 1,
    },
    opsisPoslova: {
      type: String,
      trim: true,
    },
    posebniUvjeti: [{ type: String }],
    dodatakPosebniUvjeti: {
      procenat: { type: Number, min: 0, max: 50 },
      osnov: { type: String },
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
radnoMjestoSchema.index({ kategorijaZaposlenog: 1 });
radnoMjestoSchema.index({ pozicijaKljuc: 1 });
radnoMjestoSchema.index({ platniRazred: 1 });

export const RadnoMjesto: Model<IRadnoMjesto> = model<IRadnoMjesto>(
  'RadnoMjesto',
  radnoMjestoSchema
);
