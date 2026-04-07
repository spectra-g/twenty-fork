import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type ChartFilter,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 8px;
`;

const StyledStatus = styled.span`
  color: #5f6c80;
  flex: 1;
`;

const StyledFilterChip = styled.span`
  background: #f3f4f6;
  border-radius: 4px;
  color: #1f2937;
  padding: 4px 8px;
`;

const StyledButton = styled.button`
  background: white;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  color: #1f2937;
  cursor: pointer;
  padding: 4px 8px;
`;

type DashboardFilterTemplate = {
  label: string;
  filter: ChartFilter;
};

const getDashboardFilterTemplate = ({
  pageLayout,
  objectMetadataItems,
}: {
  pageLayout: PageLayout;
  objectMetadataItems: ObjectMetadataItem[];
}): DashboardFilterTemplate | null => {
  const graphWidget = pageLayout.tabs
    .flatMap((tab) => tab.widgets)
    .find(
      (widget) =>
        widget.type === WidgetType.GRAPH &&
        isNonEmptyString(widget.objectMetadataId),
    );

  if (!isDefined(graphWidget) || !isNonEmptyString(graphWidget.objectMetadataId)) {
    return null;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (candidateObjectMetadataItem) =>
      candidateObjectMetadataItem.id === graphWidget.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const statusField = objectMetadataItem.readableFields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.name === 'status' &&
      (fieldMetadataItem.type === FieldMetadataType.SELECT ||
        fieldMetadataItem.type === FieldMetadataType.MULTI_SELECT),
  );

  if (!isDefined(statusField) || !isNonEmptyArray(statusField.options)) {
    return null;
  }

  const openOption = statusField.options.find(
    (option) =>
      option.label.toLowerCase() === 'open' ||
      option.value.toLowerCase() === 'open',
  );

  if (!isDefined(openOption)) {
    return null;
  }

  return {
    label: `${statusField.label} is ${openOption.label}`,
    filter: {
      recordFilters: [
        {
          id: 'dashboard-status-filter',
          fieldMetadataId: statusField.id,
          operand: ViewFilterOperand.IS,
          type: statusField.type,
          value: openOption.value,
        },
      ],
      recordFilterGroups: [],
    },
  };
};

export const DashboardFilterBar = ({
  pageLayout,
}: {
  pageLayout: PageLayout;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const dashboardFilters = useAtomComponentStateValue(
    dashboardFiltersComponentState,
  );
  const setDashboardFilters = useSetAtomComponentState(
    dashboardFiltersComponentState,
  );

  const filterTemplate = getDashboardFilterTemplate({
    pageLayout,
    objectMetadataItems,
  });

  const hasFilters =
    (dashboardFilters.recordFilters?.length ?? 0) > 0 ||
    (dashboardFilters.recordFilterGroups?.length ?? 0) > 0;

  const filterLabel = isDefined(filterTemplate) ? filterTemplate.label : '1 filter applied';

  return (
    <StyledContainer>
      {hasFilters ? (
        <StyledFilterChip>{filterLabel}</StyledFilterChip>
      ) : (
        <StyledStatus>No filters applied</StyledStatus>
      )}

      <StyledButton
        type="button"
        onClick={() => {
          if (!isDefined(filterTemplate)) {
            return;
          }

          // @clawdence-stub: STORY-127 - Parse URL query params to hydrate dashboard filter state on load
          setDashboardFilters(filterTemplate.filter);
        }}
      >
        Add filter
      </StyledButton>

      {hasFilters && (
        <StyledButton
          type="button"
          onClick={() => {
            setDashboardFilters({
              recordFilters: [],
              recordFilterGroups: [],
            });
          }}
        >
          Clear filters
        </StyledButton>
      )}

      {/* @clawdence-stub: STORY-123 - Add preset save/share buttons to filter bar */}
      {/* @clawdence-stub: STORY-124 - Implement GraphQL mutations for dashboard preset CRUD */}
      {/* @clawdence-stub: STORY-125 - Persist dashboard presets to database via metadata workspace migration */}
      {/* @clawdence-stub: STORY-126 - Gate preset saving and filter bar visibility by dashboard edit permissions */}
    </StyledContainer>
  );
};
