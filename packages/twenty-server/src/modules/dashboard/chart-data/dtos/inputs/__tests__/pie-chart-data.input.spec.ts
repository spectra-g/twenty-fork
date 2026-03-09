import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { TypeMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { PieChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/pie-chart-data.input';

describe('PieChartDataInput', () => {
  beforeEach(() => {
    TypeMetadataStorage.clear();
  });

  it('registers optional dashboardFilter field on GraphQL input metadata', () => {
    LazyMetadataStorage.load([PieChartDataInput]);
    TypeMetadataStorage.compile([PieChartDataInput]);

    const metadata = TypeMetadataStorage.getInputTypeMetadataByTarget(
      PieChartDataInput,
    );

    const dashboardFilterField = metadata?.properties.find(
      (property) => property.name === 'dashboardFilter',
    );

    expect(dashboardFilterField).toBeDefined();
    expect(dashboardFilterField?.options.nullable).toBe(true);
  });

  it('rejects non-object dashboardFilter values', async () => {
    const input = plainToClass(PieChartDataInput, {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { configurationType: 'pie' },
      dashboardFilter: 'invalid',
    });

    const errors = await validate(input);
    const dashboardFilterError = errors.find(
      (error) => error.property === 'dashboardFilter',
    );

    expect(dashboardFilterError).toBeDefined();
  });
});
