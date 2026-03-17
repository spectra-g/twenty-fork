import { FieldMetadataType } from 'twenty-shared/types';

import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';

describe('computeWhereConditionParts', () => {
  it('should build a trigram similarity predicate for tolerant company matching', () => {
    const { sql, params } = computeWhereConditionParts({
      operator: 'trigramSimilar',
      objectNameSingular: 'company',
      key: 'name',
      value: 'ACME Corp',
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(sql).toMatch(/^"company"\."name" % :name[a-z0-9]+$/);
    expect(Object.values(params)).toEqual(['ACME Corp']);
  });
});
