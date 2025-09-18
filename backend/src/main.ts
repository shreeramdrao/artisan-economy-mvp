import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';   // ✅ import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Stripe webhook raw body parser
  app.use(
    '/api/buyer/stripe-webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // ✅ Cookie parser middleware
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix('api');

  // ✅ CORS config
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // allow cookies
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Artisan Economy API')
    .setDescription('AI-powered marketplace for Indian artisans')
    .setVersion('1.0')
    .addTag('seller', 'Seller operations')
    .addTag('buyer', 'Buyer operations')
    .addTag('ai', 'AI services')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();