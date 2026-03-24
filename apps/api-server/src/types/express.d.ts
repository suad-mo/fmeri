import { IUser } from '@nx-fmeri/api-auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
