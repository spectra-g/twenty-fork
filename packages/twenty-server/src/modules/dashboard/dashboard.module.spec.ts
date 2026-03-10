import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('DashboardModule (AC-002 fallback unit)', () => {
  const dashboardModuleSource = readFileSync(
    join(__dirname, 'dashboard.module.ts'),
    'utf8',
  );

  it('should wire resolver and dashboard service providers', () => {
    expect(dashboardModuleSource).toContain('DashboardResolver');
    expect(dashboardModuleSource).toContain('DashboardService');
  });

  it('should not reference itself in imports (circular dependency smoke check)', () => {
    expect(dashboardModuleSource).not.toContain('forwardRef(() => DashboardModule)');
  });
});
