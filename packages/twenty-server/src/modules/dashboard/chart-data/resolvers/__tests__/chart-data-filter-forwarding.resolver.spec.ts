import { BarChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/bar-chart-data.resolver';
import { LineChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/line-chart-data.resolver';
import { PieChartDataResolver } from 'src/modules/dashboard/chart-data/resolvers/pie-chart-data.resolver';

const globalFilters = {
  recordFilters: [{ id: 'global-filter', value: 'OPEN' }],
  recordFilterGroups: [{ id: 'global-group' }],
};

const localFilters = {
  recordFilters: [{ id: 'local-filter', value: 'Acme' }],
  recordFilterGroups: [{ id: 'local-group' }],
};

const authArgs = {
  workspace: { id: 'workspace-id' } as any,
  user: { id: 'user-id' } as any,
  workspaceMemberId: 'workspace-member-id',
  userWorkspaceId: 'user-workspace-id',
};

describe('Chart data resolvers filter forwarding', () => {
  it('barChartData forwards merged global and local filters to the service layer', async () => {
    const getBarChartData = jest.fn().mockResolvedValue({ data: [] });
    const resolver = new BarChartDataResolver({
      getBarChartData,
    } as any);

    await resolver.barChartData(
      {
        objectMetadataId: 'object-id',
        globalFilters,
        configuration: {
          filter: localFilters,
        },
      } as any,
      authArgs.workspace,
      authArgs.user,
      authArgs.workspaceMemberId,
      authArgs.userWorkspaceId,
    );

    expect(getBarChartData).toHaveBeenCalledWith({
      objectMetadataId: 'object-id',
      workspaceId: 'workspace-id',
      authContext: {
        workspace: authArgs.workspace,
        user: authArgs.user,
        workspaceMemberId: authArgs.workspaceMemberId,
        userWorkspaceId: authArgs.userWorkspaceId,
      },
      configuration: {
        filter: {
          recordFilters: [
            ...globalFilters.recordFilters,
            ...localFilters.recordFilters,
          ],
          recordFilterGroups: [
            ...globalFilters.recordFilterGroups,
            ...localFilters.recordFilterGroups,
          ],
        },
      },
    });
  });

  it('lineChartData forwards merged global and local filters to the service layer', async () => {
    const getLineChartData = jest.fn().mockResolvedValue({ data: [] });
    const resolver = new LineChartDataResolver({
      getLineChartData,
    } as any);

    await resolver.lineChartData(
      {
        objectMetadataId: 'object-id',
        globalFilters,
        configuration: {
          filter: localFilters,
        },
      } as any,
      authArgs.workspace,
      authArgs.user,
      authArgs.workspaceMemberId,
      authArgs.userWorkspaceId,
    );

    expect(getLineChartData).toHaveBeenCalledWith({
      objectMetadataId: 'object-id',
      workspaceId: 'workspace-id',
      authContext: {
        workspace: authArgs.workspace,
        user: authArgs.user,
        workspaceMemberId: authArgs.workspaceMemberId,
        userWorkspaceId: authArgs.userWorkspaceId,
      },
      configuration: {
        filter: {
          recordFilters: [
            ...globalFilters.recordFilters,
            ...localFilters.recordFilters,
          ],
          recordFilterGroups: [
            ...globalFilters.recordFilterGroups,
            ...localFilters.recordFilterGroups,
          ],
        },
      },
    });
  });

  it('pieChartData forwards merged global and local filters to the service layer', async () => {
    const getPieChartData = jest.fn().mockResolvedValue({ data: [] });
    const resolver = new PieChartDataResolver({
      getPieChartData,
    } as any);

    await resolver.pieChartData(
      {
        objectMetadataId: 'object-id',
        globalFilters,
        configuration: {
          filter: localFilters,
        },
      } as any,
      authArgs.workspace,
      authArgs.user,
      authArgs.workspaceMemberId,
      authArgs.userWorkspaceId,
    );

    expect(getPieChartData).toHaveBeenCalledWith({
      objectMetadataId: 'object-id',
      workspaceId: 'workspace-id',
      authContext: {
        workspace: authArgs.workspace,
        user: authArgs.user,
        workspaceMemberId: authArgs.workspaceMemberId,
        userWorkspaceId: authArgs.userWorkspaceId,
      },
      configuration: {
        filter: {
          recordFilters: [
            ...globalFilters.recordFilters,
            ...localFilters.recordFilters,
          ],
          recordFilterGroups: [
            ...globalFilters.recordFilterGroups,
            ...localFilters.recordFilterGroups,
          ],
        },
      },
    });
  });
});
