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
  @ApiOperation({ summary: 'Register as Buyer or Seller' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto.role || !['buyer', 'seller'].includes(registerDto.role)) {
      throw new BadRequestException('Role must be either buyer or seller');
    }
    return this.authService.register(registerDto);
  }

  // ------------------ LOGIN ------------------
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as Buyer or Seller' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.login(loginDto);

    // ✅ Save authUser into cookie
    res.cookie(
      'authUser',
      JSON.stringify({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      {
        httpOnly: false, // allow frontend JS to read
        secure: false,   // set true if using HTTPS in prod
        sameSite: 'lax',
      },
    );

    return user;
  }
}