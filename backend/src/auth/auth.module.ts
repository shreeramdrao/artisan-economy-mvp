import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirestoreService } from '../common/services/firestore.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // ✅ Load environment variables automatically
    ConfigModule.forRoot({
      isGlobal: true, // makes .env variables accessible everywhere
    }),

    // ✅ Passport with JWT as default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // ✅ JWT configuration with async factory (reads from .env)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, FirestoreService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}