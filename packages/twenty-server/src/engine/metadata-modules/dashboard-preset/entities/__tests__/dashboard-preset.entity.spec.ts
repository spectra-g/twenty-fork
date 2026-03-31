import { getMetadataArgsStorage } from 'typeorm';
import { ViewVisibility } from 'twenty-shared/types';

import { AddDashboardPresetAndPageLayoutGlobalFilters1772000000000 } from 'src/database/typeorm/core/migrations/common/1772000000000-add-dashboard-preset-and-page-layout-global-filters';
import { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';

describe('DashboardPresetEntity', () => {
  it('should declare the required persisted columns', () => {
    const columns = getMetadataArgsStorage().columns.filter(
      (column) => column.target === DashboardPresetEntity,
    );

    expect(
      columns.map((column) => [
        column.propertyName,
        column.options.type,
        column.options.nullable ?? false,
      ]),
    ).toEqual(
      expect.arrayContaining([
        ['pageLayoutId', 'uuid', false],
        ['name', 'text', false],
        ['filter', 'jsonb', false],
        ['creatorId', 'uuid', false],
        ['visibility', 'enum', false],
        ['deletedAt', 'timestamptz', false],
      ]),
    );

    const visibilityColumn = columns.find(
      (column) => column.propertyName === 'visibility',
    );

    expect(visibilityColumn?.options.enum).toEqual(
      Object.values(ViewVisibility),
    );
  });
});

describe('AddDashboardPresetAndPageLayoutGlobalFilters1772000000000', () => {
  it('should create the dashboardPreset table during migration up', async () => {
    const queryRunner = {
      query: jest.fn(),
    };
    const migration =
      new AddDashboardPresetAndPageLayoutGlobalFilters1772000000000();

    await migration.up(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining(`CREATE TABLE "core"."dashboardPreset"`),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining(`"filter" jsonb NOT NULL`),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining(`"visibility" "core"."dashboardPreset_visibility_enum" NOT NULL DEFAULT 'WORKSPACE'`),
    );
  });
});
