import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';
import { DashboardService } from 'src/modules/dashboard/services/dashboard.service';

describe('DashboardResolver (AC-001 outer)', () => {
  let resolver: DashboardResolver;
  const dashboardServiceMock: Pick<
    DashboardService,
    'getStubStatus' | 'getStubVersion'
  > = {
    getStubStatus: () => 'dashboard:stub:ok',
    getStubVersion: () => 'v0',
  };

  beforeEach(() => {
    resolver = new DashboardResolver(
      {} as DashboardDuplicationService,
      dashboardServiceMock as DashboardService,
    );
  });

  it('should expose stubbed dashboard status query', () => {
    expect(resolver.dashboardStubStatus()).toBe('dashboard:stub:ok');
  });

  it('should expose stubbed dashboard version query', () => {
    expect(resolver.dashboardStubVersion()).toBe('v0');
  });
});
