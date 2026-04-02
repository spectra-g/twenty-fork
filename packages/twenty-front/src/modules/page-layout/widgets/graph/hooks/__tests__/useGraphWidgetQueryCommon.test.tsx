import { type ReactNode } from 'react';

import { DashboardFilterProvider } from '@/dashboard/contexts/DashboardFilterContext';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { renderHook } from '@testing-library/react';
import { computeRecordGqlOperationFilter, isDefined } from 'twenty-shared/utils';
import {
  AggregateOperations,
  type BarChartConfiguration,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById');
jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone');

describe('useGraphWidgetQueryCommon', () => {
  const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

  const companyNameField = companyObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );

  const companyEmployeesField = companyObjectMetadataItem.fields.find(
    (field) => field.name === 'employees',
  );

  if (!isDefined(companyNameField) || !isDefined(companyEmployeesField)) {
    throw new Error('Expected company mock metadata fields to exist');
  }

  const localFilter: RecordFilter = {
    id: 'local-filter',
    fieldMetadataId: companyNameField.id,
    value: 'Acme',
    displayValue: 'Acme',
    operand: RecordFilterOperand.CONTAINS,
    type: 'TEXT',
    label: 'Name',
  };

  const globalFilter: RecordFilter = {
    id: 'global-filter',
    fieldMetadataId: companyEmployeesField.id,
    value: '1000',
    displayValue: '1000',
    operand: RecordFilterOperand.GREATER_THAN_OR_EQUAL,
    type: 'NUMBER',
    label: 'Employees',
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <DashboardFilterProvider initialGlobalFilters={[globalFilter]}>
      {children}
    </DashboardFilterProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    (useObjectMetadataItemById as jest.Mock).mockReturnValue({
      objectMetadataItem: companyObjectMetadataItem,
    });

    (useUserTimezone as jest.Mock).mockReturnValue({
      userTimezone: 'Europe/London',
    });
  });

  it('merges dashboard global filters with widget-local filters', () => {
    const configuration: BarChartConfiguration = {
      __typename: 'BarChartConfiguration',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateFieldMetadataId: companyEmployeesField.id,
      aggregateOperation: AggregateOperations.COUNT,
      primaryAxisGroupByFieldMetadataId: companyNameField.id,
      primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
      layout: BarChartLayout.VERTICAL,
      filter: {
        recordFilters: [localFilter],
        recordFilterGroups: [],
      },
    };

    const { result } = renderHook(
      () =>
        useGraphWidgetQueryCommon({
          objectMetadataItemId: companyObjectMetadataItem.id,
          configuration,
        }),
      { wrapper },
    );

    expect(result.current.gqlOperationFilter).toEqual(
      computeRecordGqlOperationFilter({
        fields: companyObjectMetadataItem.fields,
        filterValueDependencies: {
          timeZone: 'Europe/London',
        },
        recordFilters: [globalFilter, localFilter],
        recordFilterGroups: [],
      }),
    );
  });
});
