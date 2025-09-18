import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirestoreService } from '../common/services/firestore.service';

@Module({
  imports: [],
  controllers: [AuthController], // ✅ Exposes /auth endpoints
  providers: [AuthService, FirestoreService],
  exports: [AuthService],
})
export class AuthModule {}