import { HttpException, HttpStatus } from '@nestjs/common';

export class GeminiApiException extends HttpException {
  constructor(
    message: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly geminiError?: any
  ) {
    super(
      {
        statusCode: status,
        message,
        geminiError,
        timestamp: new Date().toISOString(),
        service: 'Gemini AI'
      },
      status
    );
  }
}

export class GeminiRateLimitException extends GeminiApiException {
  constructor(message: string, geminiError?: any) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, geminiError);
  }
}

export class GeminiAuthException extends GeminiApiException {
  constructor(message: string, geminiError?: any) {
    super(message, HttpStatus.UNAUTHORIZED, geminiError);
  }
}

export class GeminiQuotaException extends GeminiApiException {
  constructor(message: string, geminiError?: any) {
    super(message, HttpStatus.FORBIDDEN, geminiError);
  }
}

export class GeminiParsingException extends GeminiApiException {
  constructor(message: string, geminiError?: any) {
    super(message, HttpStatus.BAD_REQUEST, geminiError);
  }
}