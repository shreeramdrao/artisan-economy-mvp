import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authCookie = req.cookies?.authUser;

    if (!authCookie) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const user = JSON.parse(authCookie);
      req['user'] = user; // ✅ attach user so controllers can use
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid auth cookie');
    }
  }
}