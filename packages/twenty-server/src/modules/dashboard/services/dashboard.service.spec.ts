import { DashboardService } from 'src/modules/dashboard/services/dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService();
  });

  it('should return a stub status', () => {
    expect(service.getStubStatus()).toBe('dashboard:stub:ok');
  });

  it('should return a stub version', () => {
    expect(service.getStubVersion()).toBe('v0');
  });
});
