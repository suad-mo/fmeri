import { Document, Schema, Model, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import * as argon2 from 'argon2'; // Koristimo argon2 umjesto crypto
import * as jwt from 'jsonwebtoken';

export interface AuthJSON {
  id: string;
  name: string;
  email: string;
  role: string[];
  token: string;
  expiresIn: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  hash: string;
  // Salt nam više ne treba kao polje u bazi jer ga Argon2 čuva unutar hash stringa
  role: string[];
  resetToken?: string;
  resetTokenExpiration?: Date;
  setPassword: (password: string) => Promise<void>; // Sada je Promise
  validPassword: (password: string) => Promise<boolean>; // Sada je Promise
  generateJWT: () => string;
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
    hash: {
      type: String,
    },
    role: [{ type: String }],
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
  },
  {
    methods: {
      // ARGON2 IMPLEMENTACIJA
      setPassword: async function (password: string): Promise<void> {
        // Argon2 automatski generiše siguran salt i uključuje ga u hash
        this.hash = await argon2.hash(password, {
          type: argon2.argon2id, // Najsigurnija varijanta
          memoryCost: 2 ** 16, // 64MB
          timeCost: 3,
        });
      },

      validPassword: async function (password: string): Promise<boolean> {
        try {
          // Argon2 sam zna izvući salt iz 'this.hash' i uporediti ga sa lozinkom
          return await argon2.verify(this.hash, password);
        } catch {
          return false;
        }
      },

      generateJWT: function (): string {
        const secret =
          process.env['JWT_SECRET'] || 'fallback_secret_za_dev_2026';
        // const expiresIn = process.env['EXPIRES_IN_STR'] || '1h';
        // Umjesto as any, koristimo 'as const' ili definiranje tipa
        const expiresIn = (process.env['EXPIRES_IN_STR'] ||
          '1h') as jwt.SignOptions['expiresIn'];
        return jwt.sign({ id: this._id, email: this.email }, secret, {
          expiresIn: expiresIn,
        });
      },

      toAuthJSON: function (): AuthJSON {
        const expiresIn = Number(process.env['EXPIRES_IN_MS']) || 3600;
        return {
          id: this._id.toString(),
          name: this.name,
          email: this.email,
          role: this.role,
          token: this.generateJWT(),
          expiresIn: expiresIn,
        };
      },

      // ... ostale metode (setResetToken, isRole, itd.) ostaju iste
      setResetToken: function (): void {
        const crypto = require('crypto'); // Za reset token nam je crypto i dalje OK
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
