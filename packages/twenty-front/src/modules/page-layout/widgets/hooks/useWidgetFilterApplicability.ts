import { useMemo } from 'react';
import { WidgetType } from '~/generated-metadata/graphql';

import { getWidgetFilterApplicability } from '@/page-layout/widgets/utils/widgetFilterApplicability';

export const useWidgetFilterApplicability = (
  widgetType: WidgetType | string,
) =>
  useMemo(() => getWidgetFilterApplicability(widgetType), [widgetType]);
