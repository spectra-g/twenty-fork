import { renderHook } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    objectNamePlural: 'companies',
  }),
  useSearchParams: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectNameSingularFromPlural', () => ({
  useObjectNameSingularFromPlural: jest.fn(),
}));

const mockedUseSearchParams = useSearchParams as jest.Mock;
const mockedUseObjectMetadataItem = useObjectMetadataItem as jest.Mock;
const mockedUseObjectNameSingularFromPlural =
  useObjectNameSingularFromPlural as jest.Mock;

describe('useFiltersFromQueryParams', () => {
  beforeEach(() => {
    mockedUseSearchParams.mockReturnValue([
      new URLSearchParams('filter%5Bname%5D=broken'),
      jest.fn(),
    ]);
    mockedUseObjectNameSingularFromPlural.mockReturnValue({
      objectNameSingular: 'company',
    });
    mockedUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        fields: [
          {
            id: 'field-name',
            name: 'name',
            type: 'TEXT',
          },
        ],
      },
    });
  });

  it('should treat malformed filter query params as empty filters', async () => {
    const { result } = renderHook(() => useFiltersFromQueryParams());

    await expect(result.current.getFiltersFromQueryParams()).resolves.toEqual(
      [],
    );
    await expect(
      result.current.getFilterGroupsFromQueryParams(),
    ).resolves.toEqual({
      recordFilters: [],
      recordFilterGroups: [],
    });
  });
});
