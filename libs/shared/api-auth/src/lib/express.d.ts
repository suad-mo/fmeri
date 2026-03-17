import { IUser } from './user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
