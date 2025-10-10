import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ------------------ REGISTER ------------------
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Register as Buyer or Seller (returns JWT token + cookies)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // ✅ Validate role
    if (!registerDto.role || !['buyer', 'seller'].includes(registerDto.role)) {
      throw new BadRequestException('Role must be either buyer or seller');
    }

    const result = await this.authService.register(registerDto);

    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    // ✅ Secure HTTP-only JWT cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd, // HTTPS only in production
      sameSite: isProd ? 'lax' : 'strict', // use lowercase values only ✅
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Readable cookie for frontend
    res.cookie(
      'authUser',
      JSON.stringify({
        userId: result.user.userId,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      }),
      {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? 'lax' : 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return {
      status: 'success',
      message: result.message,
      token: result.token,
      user: result.user,
    };
  }

  // ------------------ LOGIN ------------------
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Login as Buyer or Seller (returns JWT token + cookies)' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    // ✅ Secure HTTP-only JWT cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'lax' : 'strict', // ✅ lowercase only
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Frontend-readable cookie
    res.cookie(
      'authUser',
      JSON.stringify({
        userId: result.user.userId,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      }),
      {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? 'lax' : 'strict', // ✅ lowercase only
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return {
      status: 'success',
      message: result.message,
      token: result.token,
      user: result.user,
    };
  }

  // ------------------ LOGOUT ------------------
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear all cookies' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
      path: '/',
      secure: isProd,
      sameSite: isProd ? 'lax' : 'strict',
    });

    res.clearCookie('authUser', {
      path: '/',
      secure: isProd,
      sameSite: isProd ? 'lax' : 'strict',
    });

    return { status: 'success', message: 'Logged out successfully' };
  }
}