import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirestoreService } from '../common/services/firestore.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'; // ✅ Correct import

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firestoreService: FirestoreService) {}

  // ------------------ REGISTER ------------------
  async register(dto: RegisterDto) {
    const collection = dto.role === 'seller' ? 'sellers' : 'buyers';

    // 🔑 Use email as unique identifier
    const existingUser = await this.firestoreService.getDocument(
      collection,
      dto.email,
    );
    if (existingUser) {
      throw new BadRequestException(
        `${dto.role} already registered with this email`,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userData: any = {
      id: dto.email, // store email as ID in Firestore
      name: dto.name,
      email: dto.email,
      phone: dto.phone || '',
      password: hashedPassword,
      role: dto.role,
      createdAt: new Date(),
    };

    if (dto.role === 'seller') {
      userData.products = [];
      userData.totalSales = 0;
      userData.totalRevenue = 0;
      userData.rating = 0;
      userData.reviewCount = 0;
      userData.isVerified = false;
    }

    await this.firestoreService.createDocument(collection, dto.email, userData);

    this.logger.log(`${dto.role} registered successfully: ${dto.email}`);

    // ✅ Return consistent structure like login()
    return {
      status: 'success',
      message: `${dto.role} registered successfully`,
      userId: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
  }

  // ------------------ LOGIN ------------------
  async login(dto: LoginDto) {
    const collection = dto.role === 'seller' ? 'sellers' : 'buyers';

    // 🔑 Lookup by email
    const user = await this.firestoreService.getDocument(collection, dto.email);
    if (!user) {
      throw new UnauthorizedException(`${dto.role} not found`);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ✅ Return same consistent structure
    this.logger.log(`${dto.role} logged in successfully: ${dto.email}`);

    return {
      status: 'success',
      message: `${dto.role} logged in successfully`,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}