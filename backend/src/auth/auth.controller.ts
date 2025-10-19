import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SetAuthCookieService } from './set-auth-cookie.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly cookieService: SetAuthCookieService,
  ) {}

  // ------------------ REGISTER ------------------
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary:
      'Register as Buyer or Seller (returns JWT token + sets authentication cookies)',
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    // ✅ Validate role
    if (!registerDto.role || !['buyer', 'seller'].includes(registerDto.role)) {
      throw new BadRequestException('Role must be either buyer or seller');
    }

    const result = await this.authService.register(registerDto);

    // ✅ Set authentication cookies via centralized service
    this.cookieService.setCookies(req, res, result.token, result.user);

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
  @ApiOperation({
    summary:
      'Login as Buyer or Seller (returns JWT token + sets authentication cookies)',
  })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const result = await this.authService.login(loginDto);

    // ✅ Set authentication cookies via centralized service
    this.cookieService.setCookies(req, res, result.token, result.user);

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
  @ApiOperation({ summary: 'Logout and clear all authentication cookies' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // ✅ Clear cookies using centralized service (now requires req + res)
    this.cookieService.clearCookies(req, res);

    return { status: 'success', message: 'Logged out successfully' };
  }
}