import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any)?.message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log detailed error information (server-side only)
    this.logger.error(
      `Unhandled Exception: ${request.method} ${request.url}`,
      JSON.stringify({
        message: exception instanceof Error ? exception.message : 'Unknown error',
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        // Include stack trace in logs for debugging (not sent to client)
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    );

    // Secure response - never expose stack traces in production
    const secureResponse = {
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // In development, include additional error details
    if (!isProduction && exception instanceof Error) {
      Object.assign(secureResponse, {
        stack: exception.stack,
        name: exception.name,
      });
    }

    response.status(status).json(secureResponse);
  }
}
