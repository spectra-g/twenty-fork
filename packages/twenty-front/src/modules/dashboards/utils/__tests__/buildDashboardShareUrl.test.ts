import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { buildDashboardShareUrl } from '@/dashboards/utils/buildDashboardShareUrl';

const createFilter = (
  id: string,
  fieldMetadataId: string,
  value: string,
): RecordFilter => ({
  id,
  fieldMetadataId,
  value,
  displayValue: value,
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  label: fieldMetadataId,
});

describe('buildDashboardShareUrl', () => {
  it('builds deterministic URL with encoded filter operands', () => {
    const url = buildDashboardShareUrl({
      baseUrl: 'https://app.example.com/dashboards/1',
      recordFilters: [
        createFilter('f2', 'owner', 'me'),
        createFilter('f1', 'status', 'won'),
      ],
      recordFilterGroups: [],
    });

    expect(url).toBe(
      'https://app.example.com/dashboards/1?filter%5Bowner%5D%5Bis%5D=me&filter%5Bstatus%5D%5Bis%5D=won',
    );
  });

  it('returns base URL when there are no filters', () => {
    const url = buildDashboardShareUrl({
      baseUrl: 'https://app.example.com/dashboards/1',
      recordFilters: [],
      recordFilterGroups: [],
    });

    expect(url).toBe('https://app.example.com/dashboards/1');
  });

  it('appends filters to an existing query string', () => {
    const url = buildDashboardShareUrl({
      baseUrl: 'https://app.example.com/dashboards/1?tab=main',
      recordFilters: [createFilter('f1', 'status', 'won')],
      recordFilterGroups: [],
    });

    expect(url).toBe(
      'https://app.example.com/dashboards/1?tab=main&filter%5Bstatus%5D%5Bis%5D=won',
    );
  });
});
