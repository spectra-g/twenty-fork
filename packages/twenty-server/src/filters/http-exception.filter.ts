import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';

import { type Response } from 'express';

import { InvalidStatusTransitionError } from 'src/errors/invalid-status-transition.error';

@Catch(InvalidStatusTransitionError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidStatusTransitionError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return response.status(400).json({
      statusCode: 400,
      error: 'BadRequestException',
      message: exception.message,
      messages: [exception.message],
      details: {
        currentStatus: exception.currentStatus,
        attemptedStatus: exception.attemptedStatus,
      },
    });
  }
}
