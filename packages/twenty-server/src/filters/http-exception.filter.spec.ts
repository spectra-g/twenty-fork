import { type ArgumentsHost } from '@nestjs/common';

import { InvalidStatusTransitionError } from 'src/errors/invalid-status-transition.error';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should return 400 for InvalidStatusTransitionError without triggering DB write operation', () => {
    const databaseWriteOperation = jest.fn();
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({
          status,
          json,
        }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new InvalidStatusTransitionError('DRAFT', 'PUBLISHED');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledTimes(1);
    expect(databaseWriteOperation).not.toHaveBeenCalled();
  });

  it('should return response with current and attempted status and formatted message', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({
          status,
          json,
        }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new InvalidStatusTransitionError('ACTIVE', 'ARCHIVED');

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'BadRequestException',
      message: 'Invalid status transition: from ACTIVE to ARCHIVED',
      messages: ['Invalid status transition: from ACTIVE to ARCHIVED'],
      details: {
        currentStatus: 'ACTIVE',
        attemptedStatus: 'ARCHIVED',
      },
    });
  });
});
