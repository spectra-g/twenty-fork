import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { TypeMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { BarChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/bar-chart-data.input';

describe('BarChartDataInput', () => {
  beforeEach(() => {
    TypeMetadataStorage.clear();
  });

  it('registers optional globalFilter field on GraphQL input metadata', () => {
    LazyMetadataStorage.load([BarChartDataInput]);
    TypeMetadataStorage.compile([BarChartDataInput]);

    const metadata = TypeMetadataStorage.getInputTypeMetadataByTarget(
      BarChartDataInput,
    );

    const globalFilterField = metadata?.properties.find(
      (property) => property.name === 'globalFilter',
    );

    expect(globalFilterField).toBeDefined();
    expect(globalFilterField?.options.nullable).toBe(true);
  });

  it('rejects non-object globalFilter values', async () => {
    const input = plainToClass(BarChartDataInput, {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { configurationType: 'bar' },
      globalFilter: 'invalid',
    });

    const errors = await validate(input);
    const globalFilterError = errors.find(
      (error) => error.property === 'globalFilter',
    );

    expect(globalFilterError).toBeDefined();
  });
});
