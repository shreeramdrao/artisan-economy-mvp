import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ------------------ REGISTER ------------------
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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

    // ✅ Perform registration logic
    const result = await this.authService.register(registerDto);

    // ✅ Set secure HTTP-only JWT cookie (backend use only)
    res.cookie('token', result.token, {
      httpOnly: true, // JS cannot access this
      secure: process.env.NODE_ENV === 'production', // ✅ auto adjusts
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Set a readable cookie for frontend (non-sensitive)
    res.cookie(
      'authUser',
      JSON.stringify({
        userId: result.user.userId,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      }),
      {
        httpOnly: false, // Frontend can access this
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      },
    );

    // ✅ Return response payload
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
  @ApiOperation({ summary: 'Login as Buyer or Seller (returns JWT token + cookies)' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // ✅ Set secure HTTP-only JWT cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Set a readable cookie for frontend
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
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
    res.clearCookie('token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('authUser', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return { status: 'success', message: 'Logged out successfully' };
  }
}