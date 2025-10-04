import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Extract from "Authorization: Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key',
    });
  }

  // ✅ Validate and return user
  async validate(payload: JwtPayload) {
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const collection = payload.role === 'seller' ? 'sellers' : 'buyers';
    const user = await this.firestoreService.getDocument(collection, payload.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return essential info (attached to req.user)
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}