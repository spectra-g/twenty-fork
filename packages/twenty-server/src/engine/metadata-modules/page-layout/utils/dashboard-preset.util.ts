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
