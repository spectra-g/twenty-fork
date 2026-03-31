import { WidgetType } from '~/generated-metadata/graphql';

export type DashboardWidgetFilterDimension = 'owner' | 'date' | 'stage';

export type WidgetFilterApplicability = {
  supportedDimensions: DashboardWidgetFilterDimension[];
  stageOptions: string[];
};

const EMPTY_WIDGET_FILTER_APPLICABILITY: WidgetFilterApplicability = {
  supportedDimensions: [],
  stageOptions: [],
};

const DASHBOARD_WIDGET_FILTER_APPLICABILITY_BY_WIDGET_TYPE: Partial<
  Record<WidgetType, WidgetFilterApplicability>
> = {
  [WidgetType.GRAPH]: {
    supportedDimensions: ['owner', 'date', 'stage'],
    stageOptions: ['New', 'Screening', 'Meeting', 'Proposal', 'Customer'],
  },
};

export const getWidgetFilterApplicability = (
  widgetType: WidgetType | string,
): WidgetFilterApplicability =>
  DASHBOARD_WIDGET_FILTER_APPLICABILITY_BY_WIDGET_TYPE[
    widgetType as WidgetType
  ] ?? EMPTY_WIDGET_FILTER_APPLICABILITY;

export const getDashboardFilterStageOptions = (): string[] =>
  Array.from(
    new Set(
      Object.values(DASHBOARD_WIDGET_FILTER_APPLICABILITY_BY_WIDGET_TYPE)
        .flatMap((applicability) => applicability?.stageOptions ?? [])
        .filter((stageOption): stageOption is string => stageOption.length > 0),
    ),
  );
