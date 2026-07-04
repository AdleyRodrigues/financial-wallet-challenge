import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.extractMessage(exceptionResponse, exception);
    const safeMessage = this.toClientMessage(status, message);

    const body: ErrorResponse = {
      statusCode: status,
      message: safeMessage,
      error: HttpStatus[status] ?? 'Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private extractMessage(
    exceptionResponse: string | object | null,
    exception: unknown,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const message = (exceptionResponse as { message?: string | string[] })
        .message;
      if (message) {
        return message;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private toClientMessage(
    status: number,
    message: string | string[],
  ): string | string[] {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      return 'Internal server error';
    }

    return message;
  }
}
