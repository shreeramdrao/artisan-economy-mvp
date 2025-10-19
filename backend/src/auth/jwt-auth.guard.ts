import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/**
 * ✅ JwtAuthGuard
 * ----------------------
 * This guard uses the JwtStrategy to validate JWT tokens
 * before allowing access to protected routes.
 *
 * It automatically extracts the token from:
 *   - Authorization header → Bearer <token>
 *   - OR fallback → 'token' cookie
 *
 * Use it like:
 *   @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * ✅ Override getRequest() to include token from cookies.
   */
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    // Debug logging for cookie issues
    console.log('🔍 JWT Guard Debug:', {
      hasAuthHeader: !!req.headers.authorization,
      hasCookies: !!req.cookies,
      cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
      hasTokenCookie: !!req.cookies?.token,
      origin: req.get('origin'),
      userAgent: req.get('user-agent')?.substring(0, 50)
    });

    // If "Authorization" header is missing, inject from cookie
    if (!req.headers.authorization && req.cookies?.token) {
      req.headers.authorization = `Bearer ${req.cookies.token}`;
      console.log('✅ Injected token from cookie to Authorization header');
    }

    return req;
  }

  /**
   * ✅ Override handleRequest() to customize unauthorized behavior.
   */
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing JWT token');
    }
    return user;
  }
}