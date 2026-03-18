import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GeminiApiException } from '../exceptions/gemini-api.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof GeminiApiException) {
      // Handle Gemini API exceptions with proper status codes
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || exception.message;
      // Don't include detailed errorDetails in response to client
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      // Handle other custom errors
      if (exception.message.includes('Gemini API quota exceeded') || 
          exception.message.includes('Rate limit') ||
          exception.message.includes('429')) {
        status = HttpStatus.TOO_MANY_REQUESTS;
        message = exception.message;
      } else if (exception.message.includes('API key')) {
        status = HttpStatus.UNAUTHORIZED;
        message = exception.message;
      } else if (exception.message.includes('AI strategy generation failed') ||
                 exception.message.includes('AI response parsing failed')) {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
      } else {
        message = exception.message;
      }
    }

    console.error('Exception caught by filter:', {
      status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      exception: exception instanceof Error ? exception.stack : exception,
    });

    const responseBody: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Only include errorDetails if they exist (keep it minimal)
    if (errorDetails) {
      responseBody.errorDetails = errorDetails;
    }

    response.status(status).json(responseBody);
  }
}