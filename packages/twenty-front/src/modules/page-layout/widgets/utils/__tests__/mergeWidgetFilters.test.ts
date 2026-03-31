import { WidgetType } from '~/generated-metadata/graphql';

import {
  type DashboardWidgetFilter,
  mergeWidgetFilters,
} from '@/page-layout/widgets/utils/mergeWidgetFilters';

describe('mergeWidgetFilters', () => {
  it('merges only dashboard filters supported by the widget type', () => {
    const dashboardFilters: DashboardWidgetFilter[] = [
      {
        dimension: 'owner',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'created-by-field',
              operand: 'is',
              value: '["owner-1"]',
              subFieldName: 'workspaceMemberId',
            },
          ],
        },
      },
      {
        dimension: 'stage',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'stage-field',
              operand: 'is',
              value: 'PROPOSAL',
            },
          ],
        },
      },
      {
        dimension: 'date',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'created-at-field',
              operand: 'isAfter',
              value: '2026-03-01',
            },
          ],
        },
      },
    ];

    expect(
      mergeWidgetFilters({
        widgetType: WidgetType.GRAPH,
        widgetFilter: {
          recordFilters: [
            {
              fieldMetadataId: 'local-stage-field',
              operand: 'is',
              value: 'CUSTOMER',
            },
          ],
        },
        dashboardFilters,
      }),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'local-stage-field',
          operand: 'is',
          value: 'CUSTOMER',
        },
        {
          fieldMetadataId: 'created-by-field',
          operand: 'is',
          value: '["owner-1"]',
          subFieldName: 'workspaceMemberId',
        },
        {
          fieldMetadataId: 'stage-field',
          operand: 'is',
          value: 'PROPOSAL',
        },
        {
          fieldMetadataId: 'created-at-field',
          operand: 'isAfter',
          value: '2026-03-01',
        },
      ],
      recordFilterGroups: [],
    });
  });

  it('ignores dashboard filters for unsupported widget types', () => {
    expect(
      mergeWidgetFilters({
        widgetType: WidgetType.NOTES,
        widgetFilter: undefined,
        dashboardFilters: [
          {
            dimension: 'owner',
            filter: {
              recordFilters: [
                {
                  fieldMetadataId: 'created-by-field',
                  operand: 'is',
                  value: '["owner-1"]',
                  subFieldName: 'workspaceMemberId',
                },
              ],
            },
          },
        ],
      }),
    ).toEqual(undefined);
  });
});
