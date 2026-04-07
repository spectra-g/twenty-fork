/* eslint-disable @nx/enforce-module-boundaries */
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { activeDashboardPresetComponentState } from '@/page-layout/states/activeDashboardPresetComponentState';
import { DashboardPresetMenu } from '@/page-layout/components/DashboardPresetMenu';
import { DashboardSavePresetDialog } from '@/page-layout/components/DashboardSavePresetDialog';
import { DashboardShareButton } from '@/page-layout/components/DashboardShareButton';
import { useCanManageDashboardPresets } from '@/page-layout/hooks/useCanManageDashboardPresets';
import { useDashboardPresets } from '@/page-layout/hooks/useDashboardPresets';
import { useDashboardShareableUrl } from '@/page-layout/hooks/useDashboardShareableUrl';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { dashboardFiltersComponentState } from '@/page-layout/states/dashboardFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type ChartFilter,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 8px;
`;

const StyledStatus = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  flex: 1;
`;

const StyledFilterChip = styled.span`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  padding: 4px 8px;
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
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

  if (
    !isDefined(graphWidget) ||
    !isNonEmptyString(graphWidget.objectMetadataId)
  ) {
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
        } as never,
      ],
      recordFilterGroups: [],
    } as ChartFilter,
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
  const activeDashboardPreset = useAtomComponentStateValue(
    activeDashboardPresetComponentState,
  );
  const setDashboardFilters = useSetAtomComponentState(
    dashboardFiltersComponentState,
  );
  const { canManageDashboardPresets } = useCanManageDashboardPresets();
  const { presets, savePreset, renamePreset, removePreset } =
    useDashboardPresets(pageLayout.id);
  const { getDashboardShareableUrl } = useDashboardShareableUrl({
    pageLayout,
  });
  const { copyToClipboard } = useCopyToClipboard();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const filterTemplate = getDashboardFilterTemplate({
    pageLayout,
    objectMetadataItems,
  });

  const hasFilters =
    (dashboardFilters.recordFilters?.length ?? 0) > 0 ||
    (dashboardFilters.recordFilterGroups?.length ?? 0) > 0;
  const isPresetLocked =
    hasFilters &&
    isDefined(activeDashboardPreset) &&
    isDeeplyEqual(dashboardFilters, activeDashboardPreset.filterState);

  const filterLabel = isPresetLocked
    ? activeDashboardPreset.name
    : isDefined(filterTemplate)
      ? filterTemplate.label
      : t`1 filter applied`;

  return (
    <StyledContainer>
      {hasFilters ? (
        <StyledFilterChip>{filterLabel}</StyledFilterChip>
      ) : (
        <StyledStatus>{t`No filters applied`}</StyledStatus>
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
        {t`Add filter`}
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
          {t`Clear filters`}
        </StyledButton>
      )}
      <DashboardPresetMenu
        presets={presets}
        canManageDashboardPresets={canManageDashboardPresets}
        onOpenSaveDialog={() => setIsSaveDialogOpen(true)}
        onRenamePreset={renamePreset}
        onDeletePreset={removePreset}
      />
      <DashboardShareButton
        onClick={() => {
          const shareableUrl = getDashboardShareableUrl(dashboardFilters);
          void copyToClipboard(shareableUrl);
        }}
      />
      <DashboardSavePresetDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={async (name) => {
          await savePreset(name, dashboardFilters as ChartFilter);
          setIsSaveDialogOpen(false);
        }}
      />
    </StyledContainer>
  );
};
