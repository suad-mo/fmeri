import { Document, Schema, Model, model, Types } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto'; // ← PREMJEŠTENO OVDJE

export interface AuthJSON {
  id: string;
  name: string;
  email: string;
  role: string[];
  token: string;
  expiresIn: number;
  slika: string | null;
  // organizacionaJedinica: string | null;
  // radnoMjesto: string | null;
}

export interface IUser extends Document {
  name: string;
  email: string;
  hash: string;
  role: string[];
  slika?: string; // putanja do profilne slike
  // Dodjela od strane admina
  // organizacionaJedinica?: Types.ObjectId; // ref → OrganizacionaJedinica
  // radnoMjesto?: Types.ObjectId; // ref → RadnoMjesto
  zaposlenik?: Types.ObjectId; // ref → Zaposlenik
  resetToken?: string;
  resetTokenExpiration?: Date;
  refreshToken?: string; // ← novo
  refreshTokenExpiry?: Date; // ← novo
  setPassword: (password: string) => Promise<void>;
  validPassword: (password: string) => Promise<boolean>;
  generateJWT: () => string;
  generateRefreshToken: () => string; // ← novo
  toAuthJSON: () => AuthJSON;
  setResetToken: () => void;
  isRole: (newRole: string) => boolean;
  setRole: (newRole: string) => boolean;
}

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    hash: { type: String },
    role: [{ type: String }],
    slika: { type: String, default: null },
    // organizacionaJedinica: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'OrganizacionaJedinica',
    //   default: null,
    // },
    // radnoMjesto: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'RadnoMjesto',
    //   default: null,
    // },
    zaposlenik: {
      type: Schema.Types.ObjectId,
      ref: 'Zaposlenik',
      default: null,
    },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
    refreshToken: { type: String }, // ← novo
    refreshTokenExpiry: { type: Date }, // ← novo
  },
  {
    methods: {
      setPassword: async function (password: string): Promise<void> {
        this.hash = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16,
          timeCost: 3,
        });
      },

      validPassword: async function (password: string): Promise<boolean> {
        try {
          return await argon2.verify(this.hash, password);
        } catch {
          return false;
        }
      },

      generateJWT: function (): string {
        const secret = process.env['JWT_SECRET'];
        // ← GUARD: baci grešku ako secret nije definisan
        if (!secret) {
          throw new Error('JWT_SECRET nije definisan u .env fajlu!');
        }
        const expiresIn = (process.env['EXPIRES_IN_STR'] ||
          '1h') as jwt.SignOptions['expiresIn'];
        return jwt.sign({ id: this._id, email: this.email }, secret, {
          expiresIn,
        });
      },

      generateRefreshToken: function (): string {
        const secret = process.env['JWT_REFRESH_SECRET'];
        if (!secret) {
          throw new Error('JWT_REFRESH_SECRET nije definisan u .env fajlu!');
        }
        const token = jwt.sign({ id: this._id }, secret, { expiresIn: '7d' });

        // Sačuvaj hashed verziju u bazu — nikad plain token
        this.refreshToken = crypto
          .createHash('sha256')
          .update(token)
          .digest('hex');
        this.refreshTokenExpiry = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        return token; // Vrati plain token klijentu
      },

      toAuthJSON: function (): AuthJSON {
        const expiresIn = Number(process.env['EXPIRES_IN_MS']) || 3600;
        return {
          id: this._id.toString(),
          name: this.name,
          email: this.email,
          role: this.role,
          token: this.generateJWT(),
          expiresIn,
          slika: this.slika || null,
          // organizacionaJedinica: this.organizacionaJedinica?.toString() || null,
          // radnoMjesto: this.radnoMjesto?.toString() || null,
          // refreshToken se setuje kao cookie u controlleru
        };
      },

      setResetToken: function (): void {
        // ← crypto se koristi direktno, bez require()
        this.resetToken = crypto.randomBytes(20).toString('hex');
        const expiresInMs = Number(process.env['EXPIRES_IN_MS']) || 3600000;
        this.resetTokenExpiration = new Date(Date.now() + expiresInMs);
      },

      isRole: function (newRole: string): boolean {
        return this.role.includes(newRole);
      },

      setRole: function (newRole: string): boolean {
        const hasRole = this.isRole(newRole);
        if (hasRole) {
          this.role = this.role.filter((r) => r !== newRole);
        } else {
          this.role.push(newRole);
        }
        return hasRole;
      },
    },
    timestamps: true,
  },
);

userSchema.plugin(uniqueValidator, { message: 'is already taken.' });

export const User: Model<IUser> = model<IUser>('User', userSchema);
