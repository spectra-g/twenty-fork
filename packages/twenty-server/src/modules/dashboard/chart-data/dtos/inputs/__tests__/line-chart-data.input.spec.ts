import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { TypeMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { LineChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/line-chart-data.input';

describe('LineChartDataInput', () => {
  beforeEach(() => {
    TypeMetadataStorage.clear();
  });

  it('registers optional dashboardFilter field on GraphQL input metadata', () => {
    LazyMetadataStorage.load([LineChartDataInput]);
    TypeMetadataStorage.compile([LineChartDataInput]);

    const metadata = TypeMetadataStorage.getInputTypeMetadataByTarget(
      LineChartDataInput,
    );

    const dashboardFilterField = metadata?.properties.find(
      (property) => property.name === 'dashboardFilter',
    );

    expect(dashboardFilterField).toBeDefined();
    expect(dashboardFilterField?.options.nullable).toBe(true);
  });

  it('rejects non-object dashboardFilter values', async () => {
    const input = plainToClass(LineChartDataInput, {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { configurationType: 'line' },
      dashboardFilter: 'invalid',
    });

    const errors = await validate(input);
    const dashboardFilterError = errors.find(
      (error) => error.property === 'dashboardFilter',
    );

    expect(dashboardFilterError).toBeDefined();
  });
});
