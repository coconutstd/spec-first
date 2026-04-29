import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { ValidationError } from 'class-validator';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ThrottlerException) {
      return response.status(429).json({
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요',
      });
    }

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any;
      const errors = this.extractValidationErrors(exceptionResponse);

      return response.status(400).json({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: '입력값이 올바르지 않습니다',
        errors,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (exceptionResponse && typeof exceptionResponse === 'object' && exceptionResponse.code) {
        return response.status(status).json({
          statusCode: exceptionResponse.statusCode ?? status,
          code: exceptionResponse.code,
          message: exceptionResponse.message,
        });
      }

      return response.status(status).json({
        statusCode: status,
        code: 'INTERNAL_ERROR',
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse?.message ?? 'Internal server error'),
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }

  private extractValidationErrors(
    exceptionResponse: any,
  ): Array<{ field: string; message: string }> {
    if (!exceptionResponse?.message) return [];

    const messages = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message
      : [exceptionResponse.message];

    return messages.map((msg: string | ValidationError) => {
      if (typeof msg === 'string') {
        return { field: 'unknown', message: msg };
      }
      return { field: 'unknown', message: String(msg) };
    });
  }
}
