import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

export interface UserData {
  userId: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

@Injectable()
export class SetAuthCookieService {
  /**
   * Sets authentication cookies with environment-aware configuration
   * Works seamlessly across localhost, ngrok, and production.
   */
  setCookies(req: Request, res: Response, token: string, user: UserData): void {
    const origin = req.get('origin') || '';
    const isProd = process.env.NODE_ENV === 'production';
    const isNgrok = origin.includes('ngrok');
    const isLocal = origin.includes('localhost');

    // Environment-aware cookie attributes
    const sameSite = isNgrok ? 'none' : isProd ? 'lax' : 'lax';
    const secure = isNgrok || isProd;

    // Common options
    const baseOptions = {
      secure,
      sameSite: sameSite as 'lax' | 'none' | 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Token cookie (httpOnly)
    res.cookie('token', token, {
      ...baseOptions,
      httpOnly: true,
    });

    // Readable user cookie
    res.cookie('authUser', JSON.stringify(user), {
      ...baseOptions,
      httpOnly: false,
    });
  }

  /**
   * Clears both authentication cookies safely
   */
  clearCookies(req: Request, res: Response): void {
    const origin = req.get('origin') || '';
    const isProd = process.env.NODE_ENV === 'production';
    const isNgrok = origin.includes('ngrok');
    const sameSite = isNgrok ? 'none' : isProd ? 'lax' : 'lax';
    const secure = isNgrok || isProd;

    const clearOptions = {
      path: '/',
      secure,
      sameSite: sameSite as 'lax' | 'none' | 'strict',
    };

    res.clearCookie('token', clearOptions);
    res.clearCookie('authUser', clearOptions);
  }
}