// src/types/express.d.ts
import { JwtPayload } from '../../auth/jwt.strategy';

declare global {
  namespace Express {
    interface User extends JwtPayload {
      name?: string;
      role: 'buyer' | 'seller';
    }

    interface Request {
      user?: User;
    }
  }
}

export {};