import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { FirestoreService } from '../common/services/firestore.service';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'buyer' | 'seller';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ✅ 1. Explicitly read from cookies
        (req: Request): string | null => {
          if (req?.cookies?.token) {
            return req.cookies.token;
          }
          return null;
        },
        // ✅ 2. Read from Authorization header (Bearer)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // ✅ 3. Read from 'authorization' header (if manually sent)
        ExtractJwt.fromHeader('authorization'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key',
    });
  }

  // ✅ Validate token payload and user existence
  async validate(payload: JwtPayload) {
    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (!payload.email || !payload.role) {
      throw new UnauthorizedException('Incomplete token payload');
    }

    if (!['buyer', 'seller'].includes(payload.role)) {
      throw new UnauthorizedException('Invalid user role');
    }

    // Email sanity check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      throw new UnauthorizedException('Invalid email format');
    }

    try {
      // 🔍 Firestore lookup for user validation
      const collection = payload.role === 'seller' ? 'sellers' : 'buyers';
      const user = await this.firestoreService.getDocument(collection, payload.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 🔒 Security checks
      if (user.status === 'suspended') {
        throw new UnauthorizedException('Account suspended');
      }

      if (user.status === 'deleted') {
        throw new UnauthorizedException('Account deleted');
      }

      // ✅ Attach user to req.user for controllers
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}