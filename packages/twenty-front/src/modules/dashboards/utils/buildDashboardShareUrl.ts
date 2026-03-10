import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const buildDashboardShareUrl = ({
  baseUrl,
  recordFilters,
}: {
  baseUrl: string;
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
}) => {
  const params = new URLSearchParams();

  const sortedFilters = [...recordFilters].sort((left, right) =>
    left.fieldMetadataId.localeCompare(right.fieldMetadataId),
  );

  for (const filter of sortedFilters) {
    const operand = String(filter.operand).toLowerCase();

    params.append(
      `filter[${filter.fieldMetadataId}][${operand}]`,
      String(filter.value),
    );
  }

  const queryString = params.toString();

  if (!queryString) {
    return baseUrl;
  }

  return `${baseUrl}?${queryString}`;
};
