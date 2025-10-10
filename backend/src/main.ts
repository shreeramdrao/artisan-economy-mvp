import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap'); // ✅ Use static logger

  // ✅ Secure headers
  app.use(helmet());

  // ✅ Serve static assets (favicon, apple-touch-icon, etc.)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // ✅ Stripe webhook raw body parser (MUST come before JSON parser)
  app.use(
    '/api/buyer/stripe-webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // ✅ Cookie parser (JWT + user info)
  app.use(cookieParser());

  // ✅ JSON & URL-encoded parsers
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  // ✅ Global prefix
  app.setGlobalPrefix('api');

  // ✅ CORS configuration (Production-ready)
  app.enableCors({
    origin: [
      'https://artisan-frontend-188692597311.asia-south1.run.app',
      'https://buyerartisaneconomy.in',
      'https://sellerartisaneconomy.in',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ✅ Global filters & interceptors
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

  // ✅ Health endpoints for Cloud Run
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

  // ✅ Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Artisan Economy backend running at: http://localhost:${port}/api/docs`);

  // ✅ Graceful shutdown for Cloud Run
  const gracefulShutdown = async (signal: string) => {
    logger.warn(`🛑 Received ${signal}. Starting graceful shutdown...`);
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