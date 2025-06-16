import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    const finalMessage =
      typeof message === 'string'
        ? message
        : (message as any).message || 'Error';

    const error = isHttpException
      ? (exception.getResponse() as any).error || exception.name
      : exception.name || 'Error';

    response.status(status).json({
      success: false,
      message: finalMessage,
      error: error,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
