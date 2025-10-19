import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as bodyParser from 'body-parser';
import cookieParser = require('cookie-parser');
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ✅ Helmet for secure headers (only in production)
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    app.use(
      helmet({
        crossOriginResourcePolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );
  }

  // ✅ Serve static assets
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/' });

  // ✅ Stripe webhook (must come before JSON parser)
  app.use(
    '/api/buyer/stripe-webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // ✅ Cookie parser
  app.use(cookieParser());


  // ✅ Development vs Production configuration
  if (isDev) {
    logger.warn('⚠️ Running in DEV mode: CORS & Helmet DISABLED');
    
    // ✅ Disable Helmet entirely in development
    // (Helmet is already configured above, but we'll skip it in dev)
    
    // ✅ Completely open CORS for development
    app.enableCors({
      origin: true,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Set-Cookie', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
  } else {
    logger.log('🔒 Running in PRODUCTION mode: CORS & Helmet ENABLED');
    
    // ✅ Dynamic CORS setup for production
    app.enableCors({
      origin: (origin, callback) => {
        // 👇 Strict whitelist for production
        const allowedOrigins = [
          'https://buyer.artisaneconomy.in',
          'https://seller.artisaneconomy.in',
          'https://artisan-frontend-188692597311.asia-south1.run.app',
          process.env.FRONTEND_URL,
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
          callback(null, origin);
        } else {
          logger.warn(`❌ Blocked by CORS: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Set-Cookie', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
  }

  // ✅ Body parsers
  app.use(
    bodyParser.json({
      limit: '2mb',
      verify: (req, res, buf) => {
        if (buf.length > 2 * 1024 * 1024)
          throw new Error('Request payload too large');
      },
    }),
  );
  app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));

  // ✅ Global prefix
  app.setGlobalPrefix('api');

  // ✅ Global validation, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(configService));
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ✅ Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Artisan Economy API')
    .setDescription('AI-powered marketplace for Indian artisans')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Authentication (Register/Login)')
    .addTag('seller', 'Seller operations')
    .addTag('buyer', 'Buyer operations')
    .addTag('ai', 'AI services')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ✅ Health endpoints
  app.getHttpAdapter().get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.getHttpAdapter().get('/api/ready', (req: Request, res: Response) => {
    res.json({
      status: 'ready',
      service: 'artisan-economy-backend',
      timestamp: new Date().toISOString(),
    });
  });

  app.getHttpAdapter().get('/api/live', (req: Request, res: Response) => {
    res.json({
      status: 'alive',
      service: 'artisan-economy-backend',
      timestamp: new Date().toISOString(),
    });
  });

  // ✅ Debug CORS endpoint
  app.getHttpAdapter().get('/api/debug-cors', (req: Request, res: Response) => {
    res
      .setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
      .setHeader('Access-Control-Allow-Credentials', 'true')
      .json({
        originReceived: req.headers.origin,
        nodeEnv: process.env.NODE_ENV,
        message: 'CORS debug endpoint active',
      });
  });

  // ✅ Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(
    `🚀 Backend running at http://localhost:${port}/api/docs (CORS + Cookies enabled)`
  );

  // ✅ Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.warn(`🛑 Received ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
      logger.log('✅ Server closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection:', { reason, promise });
    gracefulShutdown('unhandledRejection');
  });
}

bootstrap();