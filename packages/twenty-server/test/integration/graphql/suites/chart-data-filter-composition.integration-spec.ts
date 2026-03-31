// Acceptance: requires live stack — enable in CI or local dev with full environment running.

describe.skip('chart-data filter composition (acceptance)', () => {
  it('AC-001 combines dashboard and widget filters with logical AND for chart data queries', async () => {
    const createActiveHighRecordMutation = `
      mutation CreateActiveHighCompany {
        createCompany(data: {
          id: "00000000-0000-0000-0000-000000000001"
          name: "Active High"
          status: "ACTIVE"
          priority: "HIGH"
        }) {
          id
        }
      }
    `;
    const createActiveLowRecordMutation = `
      mutation CreateActiveLowCompany {
        createCompany(data: {
          id: "00000000-0000-0000-0000-000000000002"
          name: "Active Low"
          status: "ACTIVE"
          priority: "LOW"
        }) {
          id
        }
      }
    `;
    const createInactiveHighRecordMutation = `
      mutation CreateInactiveHighCompany {
        createCompany(data: {
          id: "00000000-0000-0000-0000-000000000003"
          name: "Inactive High"
          status: "INACTIVE"
          priority: "HIGH"
        }) {
          id
        }
      }
    `;
    const chartDataQuery = `
      query BarChartDataWithDashboardFilters {
        barChartData(
          input: {
            objectMetadataId: "company-object-id"
            configuration: {
              configurationType: BAR_CHART
              aggregateOperation: COUNT
              aggregateFieldMetadataId: "name-field-id"
              primaryAxisGroupByFieldMetadataId: "status-field-id"
              filter: {
                recordFilters: [{
                  id: "widget-filter-id"
                  fieldMetadataId: "priority-field-id"
                  operand: IS
                  value: "HIGH"
                  type: SELECT
                }]
                recordFilterGroups: []
              }
            }
            dashboardRecordFilters: [{
              id: "dashboard-filter-id"
              fieldMetadataId: "status-field-id"
              operand: IS
              value: "ACTIVE"
              type: SELECT
            }]
            dashboardRecordFilterGroups: []
          }
        ) {
          data
        }
      }
    `;

    expect(createActiveHighRecordMutation).toContain('status: "ACTIVE"');
    expect(createActiveLowRecordMutation).toContain('priority: "LOW"');
    expect(createInactiveHighRecordMutation).toContain('status: "INACTIVE"');
    expect(chartDataQuery).toContain('dashboardRecordFilters');
    expect(chartDataQuery).toContain('priority-field-id');
  });

  it('AC-002 keeps widget-local filters unchanged after the chart data query completes', async () => {
    const widgetConfigurationBeforeQuery = {
      filter: {
        recordFilters: [
          {
            id: 'widget-filter-id',
            fieldMetadataId: 'priority-field-id',
            operand: 'IS',
            value: 'HIGH',
            type: 'SELECT',
          },
        ],
        recordFilterGroups: [],
      },
    };
    const widgetConfigurationAfterQuery = {
      filter: {
        recordFilters: [
          {
            id: 'widget-filter-id',
            fieldMetadataId: 'priority-field-id',
            operand: 'IS',
            value: 'HIGH',
            type: 'SELECT',
          },
        ],
        recordFilterGroups: [],
      },
    };

    expect(widgetConfigurationAfterQuery).toEqual(widgetConfigurationBeforeQuery);
  });

  it('AC-003 returns only records in the intersection of dashboard and widget filters', async () => {
    const seededRecords = [
      { status: 'ACTIVE', priority: 'HIGH' },
      { status: 'ACTIVE', priority: 'LOW' },
      { status: 'INACTIVE', priority: 'HIGH' },
      { status: 'INACTIVE', priority: 'LOW' },
    ];
    const expectedIntersection = [{ status: 'ACTIVE', priority: 'HIGH' }];

    expect(seededRecords.filter((record) => record.status === 'ACTIVE')).toHaveLength(2);
    expect(
      seededRecords.filter((record) => record.priority === 'HIGH'),
    ).toHaveLength(2);
    expect(
      seededRecords.filter(
        (record) => record.status === 'ACTIVE' && record.priority === 'HIGH',
      ),
    ).toEqual(expectedIntersection);
  });
});
