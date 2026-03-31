import { renderHook } from '@testing-library/react';

import { useCanPersistDashboardFilters } from '@/dashboards/hooks/useCanPersistDashboardFilters';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: jest.fn(),
}));

describe('useCanPersistDashboardFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when the user lacks layouts permission', () => {
    (useHasPermissionFlag as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useCanPersistDashboardFilters());

    expect(useHasPermissionFlag).toHaveBeenCalledWith(
      PermissionFlagType.LAYOUTS,
    );
    expect(result.current.canPersistDashboardFilters).toBe(false);
  });

  it('should return true when the user has layouts permission', () => {
    (useHasPermissionFlag as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useCanPersistDashboardFilters());

    expect(result.current.canPersistDashboardFilters).toBe(true);
  });
});
