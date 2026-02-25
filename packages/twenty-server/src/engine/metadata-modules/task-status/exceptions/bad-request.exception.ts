import { BadRequestException } from '@nestjs/common';

export class TaskStatusBadRequestException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
