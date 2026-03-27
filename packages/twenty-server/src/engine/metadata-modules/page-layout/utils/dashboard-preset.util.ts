import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type DashboardPresetDTO } from 'src/engine/metadata-modules/page-layout/dtos/dashboard-preset.dto';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

const EMPTY_FILTER_STATE = {};

export const getDashboardPresetsFromFlatPageLayout = (
  flatPageLayout: Pick<FlatPageLayout, 'dashboardPresets'>,
): DashboardPresetDTO[] => {
  return flatPageLayout.dashboardPresets ?? [];
};

export const findDashboardPresetOrThrow = ({
  flatPageLayout,
  presetId,
}: {
  flatPageLayout: Pick<FlatPageLayout, 'dashboardPresets'>;
  presetId: string;
}): DashboardPresetDTO => {
  const preset = getDashboardPresetsFromFlatPageLayout(flatPageLayout).find(
    (candidatePreset) => candidatePreset.id === presetId,
  );

  if (!isDefined(preset)) {
    throw new PageLayoutException(
      generatePageLayoutExceptionMessage(
        PageLayoutExceptionMessageKey.DASHBOARD_PRESET_NOT_FOUND,
        presetId,
      ),
      PageLayoutExceptionCode.DASHBOARD_PRESET_NOT_FOUND,
    );
  }

  return {
    ...preset,
    filterState: preset.filterState ?? EMPTY_FILTER_STATE,
  };
};

const normalizeDashboardPresetName = (name: string) =>
  name.trim().toLocaleLowerCase();

export const assertDashboardPresetNameIsUniqueOrThrow = ({
  flatPageLayout,
  presetName,
  excludedPresetId,
}: {
  flatPageLayout: Pick<FlatPageLayout, 'dashboardPresets'>;
  presetName: string;
  excludedPresetId?: string;
}) => {
  const normalizedPresetName = normalizeDashboardPresetName(presetName);

  const hasConflictingPreset = getDashboardPresetsFromFlatPageLayout(
    flatPageLayout,
  ).some(
    (candidatePreset) =>
      candidatePreset.id !== excludedPresetId &&
      normalizeDashboardPresetName(candidatePreset.name) ===
        normalizedPresetName,
  );

  if (!hasConflictingPreset) {
    return;
  }

  throw new PageLayoutException(
    generatePageLayoutExceptionMessage(
      PageLayoutExceptionMessageKey.DASHBOARD_PRESET_NAME_ALREADY_EXISTS,
      presetName,
    ),
    PageLayoutExceptionCode.DASHBOARD_PRESET_NAME_ALREADY_EXISTS,
  );
};
