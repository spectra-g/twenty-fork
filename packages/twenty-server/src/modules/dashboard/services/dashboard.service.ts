import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getStubStatus(): string {
    return 'dashboard:stub:ok';
  }

  getStubVersion(): string {
    return 'v0';
  }
}
