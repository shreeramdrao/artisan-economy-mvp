import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirestoreService } from '../common/services/firestore.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'buyer' | 'seller';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly jwtService: JwtService,
  ) {}

  // ------------------ REGISTER ------------------
  async register(dto: RegisterDto) {
    const collection = dto.role === 'seller' ? 'sellers' : 'buyers';

    // 🔎 Check if email already exists
    const existingUser = await this.firestoreService.getDocument(collection, dto.email);
    if (existingUser) {
      throw new BadRequestException(`${dto.role} already registered with this email`);
    }

    // 🔒 Hash password before saving
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userData: any = {
      id: dto.email,
      name: dto.name,
      email: dto.email,
      phone: dto.phone || '',
      password: hashedPassword,
      role: dto.role,
      createdAt: new Date(),
    };

    if (dto.role === 'seller') {
      Object.assign(userData, {
        products: [],
        totalSales: 0,
        totalRevenue: 0,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
      });
    }

    // 🧾 Save to Firestore
    await this.firestoreService.createDocument(collection, dto.email, userData);
    this.logger.log(`${dto.role} registered successfully: ${dto.email}`);

    // 🎟️ Generate JWT Token
    const payload: JwtPayload = { userId: userData.id, email: userData.email, role: userData.role };
    const token = this.jwtService.sign(payload);

    return {
      status: 'success',
      message: `${dto.role} registered successfully`,
      token,
      user: {
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
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

    this.logger.log(`${dto.role} logged in successfully: ${dto.email}`);

    // 🎟️ Generate JWT Token
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      status: 'success',
      message: `${dto.role} logged in successfully`,
      token,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ------------------ VERIFY TOKEN ------------------
  async verifyToken(token: string): Promise<{ valid: boolean; decoded?: JwtPayload; message?: string }> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token);
      return { valid: true, decoded };
    } catch (err) {
      this.logger.warn(`❌ Invalid or expired JWT: ${err.message}`);
      return { valid: false, message: 'Invalid or expired token' };
    }
  }
}