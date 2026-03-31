import { getMetadataArgsStorage } from 'typeorm';

import { AddDashboardPresetAndPageLayoutGlobalFilters1772000000000 } from 'src/database/typeorm/core/migrations/common/1772000000000-add-dashboard-preset-and-page-layout-global-filters';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

describe('PageLayoutEntity', () => {
  it('should declare a nullable jsonb globalFilters column', () => {
    const globalFiltersColumn = getMetadataArgsStorage().columns.find(
      (column) =>
        column.target === PageLayoutEntity &&
        column.propertyName === 'globalFilters',
    );

    expect(globalFiltersColumn?.options).toMatchObject({
      type: 'jsonb',
      nullable: true,
    });
  });
});

describe('AddDashboardPresetAndPageLayoutGlobalFilters1772000000000', () => {
  it('should add the page layout globalFilters column during migration up', async () => {
    const queryRunner = {
      query: jest.fn(),
    };
    const migration =
      new AddDashboardPresetAndPageLayoutGlobalFilters1772000000000();

    await migration.up(queryRunner as never);

    expect(queryRunner.query).toHaveBeenCalledWith(
      `ALTER TABLE "core"."pageLayout" ADD "globalFilters" jsonb`,
    );
  });
});
