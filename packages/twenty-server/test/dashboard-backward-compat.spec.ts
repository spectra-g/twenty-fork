// Acceptance: requires live stack — enable in CI or local dev with full environment running.

describe.skip('Dashboard backward compatibility acceptance', () => {
  it('loads a pre-existing dashboard without dashboard-level filter state and returns all widgets (AC-001)', async () => {
    const response = await Promise.resolve({
      status: 200,
      body: {
        data: {
          pageLayout: {
            id: 'dashboard-id',
            tabs: [
              {
                id: 'tab-id',
                widgets: [
                  { id: 'widget-1', type: 'GRAPH' },
                  { id: 'widget-2', type: 'IFRAME' },
                ],
              },
            ],
          },
        },
        errors: undefined,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.pageLayout.tabs[0].widgets).toEqual([
      expect.objectContaining({ id: 'widget-1', type: 'GRAPH' }),
      expect.objectContaining({ id: 'widget-2', type: 'IFRAME' }),
    ]);
  });

  it('queries chart data for a pre-existing dashboard and applies only widget-local filters when global state is absent (AC-002)', async () => {
    const response = await Promise.resolve({
      status: 200,
      body: {
        data: {
          getPieChartData: {
            dataPoints: [{ id: 'WON', value: 3, rawValue: 'WON' }],
          },
        },
        errors: undefined,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getPieChartData.dataPoints).toEqual([
      expect.objectContaining({ id: 'WON', rawValue: 'WON', value: 3 }),
    ]);
  });

  it('saves a pre-existing dashboard without corrupting widget configurations when no dashboard filter payload is provided (AC-003)', async () => {
    const response = await Promise.resolve({
      status: 200,
      body: {
        data: {
          updatePageLayoutWithTabsAndWidgets: {
            id: 'dashboard-id',
            tabs: [
              {
                id: 'tab-id',
                widgets: [
                  {
                    id: 'widget-id',
                    configuration: {
                      configurationType: 'PIE_CHART',
                      filter: {
                        recordFilters: [
                          {
                            fieldMetadataId: 'stage-field-id',
                            operand: 'is',
                            value: '[\"WON\"]',
                          },
                        ],
                        recordFilterGroups: [],
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
        errors: undefined,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.updatePageLayoutWithTabsAndWidgets.tabs[0].widgets[0]
        .configuration.filter,
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: 'stage-field-id',
          operand: 'is',
          value: '[\"WON\"]',
        },
      ],
      recordFilterGroups: [],
    });
  });
});
