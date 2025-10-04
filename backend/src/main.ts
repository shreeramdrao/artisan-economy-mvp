import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // ✅ Secure headers (prevents common web vulnerabilities)
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

  // ✅ Cookie parser (read cookies like JWT + user info)
  app.use(cookieParser());

  // ✅ JSON & URL-encoded parsers
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  // ✅ Set global API prefix
  app.setGlobalPrefix('api');

  // ✅ CORS configuration (Safari + HTTPS-friendly)
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
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
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ✅ Swagger setup (with JWT support)
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ✅ Server startup
  const port = configService.get('PORT') || 8080;
  await app.listen(port, '0.0.0.0');

  console.log(
    `🚀 Artisan Economy backend running at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();