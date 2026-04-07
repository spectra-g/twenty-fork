import { renderHook } from '@testing-library/react';

import { useCanManageDashboardPresets } from '@/page-layout/hooks/useCanManageDashboardPresets';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: jest.fn(),
}));

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: jest.fn(),
}));

const { useObjectMetadataItems } = jest.requireMock(
  '@/object-metadata/hooks/useObjectMetadataItems',
);
const { useObjectPermissions } = jest.requireMock(
  '@/object-record/hooks/useObjectPermissions',
);

describe('useCanManageDashboardPresets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when dashboard update permission is denied', () => {
    useObjectMetadataItems.mockReturnValue({
      objectMetadataItems: [
        {
          id: 'dashboard-object-metadata-id',
          nameSingular: 'dashboard',
        },
      ],
    });

    useObjectPermissions.mockReturnValue({
      objectPermissionsByObjectMetadataId: {
        'dashboard-object-metadata-id': {
          objectMetadataId: 'dashboard-object-metadata-id',
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      },
    });

    const { result } = renderHook(() => useCanManageDashboardPresets());

    expect(result.current.canManageDashboardPresets).toBe(false);
  });

  it('should return true when dashboard update permission is allowed', () => {
    useObjectMetadataItems.mockReturnValue({
      objectMetadataItems: [
        {
          id: 'dashboard-object-metadata-id',
          nameSingular: 'dashboard',
        },
      ],
    });

    useObjectPermissions.mockReturnValue({
      objectPermissionsByObjectMetadataId: {
        'dashboard-object-metadata-id': {
          objectMetadataId: 'dashboard-object-metadata-id',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
          restrictedFields: {},
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      },
    });

    const { result } = renderHook(() => useCanManageDashboardPresets());

    expect(result.current.canManageDashboardPresets).toBe(true);
  });

  it('should return false when dashboard metadata is unavailable', () => {
    useObjectMetadataItems.mockReturnValue({
      objectMetadataItems: [],
    });

    useObjectPermissions.mockReturnValue({
      objectPermissionsByObjectMetadataId: {},
    });

    const { result } = renderHook(() => useCanManageDashboardPresets());

    expect(result.current.canManageDashboardPresets).toBe(false);
  });
});
