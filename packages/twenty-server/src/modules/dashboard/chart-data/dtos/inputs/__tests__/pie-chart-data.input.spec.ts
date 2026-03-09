import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { TypeMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/type-metadata.storage';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { PieChartDataInput } from 'src/modules/dashboard/chart-data/dtos/inputs/pie-chart-data.input';

describe('PieChartDataInput', () => {
  beforeEach(() => {
    TypeMetadataStorage.clear();
  });

  it('registers optional globalFilter field on GraphQL input metadata', () => {
    LazyMetadataStorage.load([PieChartDataInput]);
    TypeMetadataStorage.compile([PieChartDataInput]);

    const metadata = TypeMetadataStorage.getInputTypeMetadataByTarget(
      PieChartDataInput,
    );

    const globalFilterField = metadata?.properties.find(
      (property) => property.name === 'globalFilter',
    );

    expect(globalFilterField).toBeDefined();
    expect(globalFilterField?.options.nullable).toBe(true);
  });

  it('rejects non-object globalFilter values', async () => {
    const input = plainToClass(PieChartDataInput, {
      objectMetadataId: 'f92d76e8-a577-43f6-a5f1-31fe455de6f5',
      configuration: { configurationType: 'pie' },
      globalFilter: 'invalid',
    });

    const errors = await validate(input);
    const globalFilterError = errors.find(
      (error) => error.property === 'globalFilter',
    );

    expect(globalFilterError).toBeDefined();
  });
});
