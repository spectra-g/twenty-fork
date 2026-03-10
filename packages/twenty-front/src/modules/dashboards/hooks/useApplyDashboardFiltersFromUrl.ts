import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ViewFilterOperand } from 'twenty-shared/types';
import qs from 'qs';

export const useApplyDashboardFiltersFromUrl = () => {
  const [searchParams] = useSearchParams();
  const hasHydratedRef = useRef(false);
  const { replaceAllFilters } = useDashboardFilters();

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }

    hasHydratedRef.current = true;

    const parsedQuery = qs.parse(searchParams.toString());
    const filterEntry = parsedQuery.filter;

    if (!filterEntry || typeof filterEntry !== 'object') {
      return;
    }

    const recordFilters = Object.entries(filterEntry)
      .flatMap(([fieldMetadataId, operandMap], fieldIndex) => {
        if (!operandMap || typeof operandMap !== 'object') {
          return [];
        }

        return Object.entries(operandMap).map(([operand, value], operandIndex) => ({
          id: `dashboard-url-filter-${fieldIndex}-${operandIndex}`,
          fieldMetadataId,
          value: String(value),
          displayValue: String(value),
          type: 'TEXT' as const,
          operand: operand.toUpperCase() as ViewFilterOperand,
          label: fieldMetadataId,
        }));
      });

    if (recordFilters.length === 0) {
      return;
    }

    replaceAllFilters({
      recordFilters,
      recordFilterGroups: [],
    });
  }, [replaceAllFilters, searchParams]);
};
