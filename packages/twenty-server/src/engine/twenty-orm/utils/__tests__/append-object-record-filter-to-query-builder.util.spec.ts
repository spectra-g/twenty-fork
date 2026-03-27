import { Brackets } from 'typeorm';

import { appendObjectRecordFilterToQueryBuilder } from 'src/engine/twenty-orm/utils/apply-row-level-permission-predicates.util';

describe('appendObjectRecordFilterToQueryBuilder', () => {
  it('should use where when the query builder has no existing filters', () => {
    const where = jest.fn();
    const andWhere = jest.fn();

    appendObjectRecordFilterToQueryBuilder({
      queryBuilder: {
        expressionMap: {
          wheres: [],
        },
        where,
        andWhere,
      } as any,
      objectNameSingular: 'company',
      recordFilter: {
        name: {
          ilike: '%Story 73%',
        },
      },
      fieldParser: {
        parse: jest.fn(),
      } as any,
    });

    expect(where).toHaveBeenCalledTimes(1);
    expect(where.mock.calls[0][0]).toBeInstanceOf(Brackets);
    expect(andWhere).not.toHaveBeenCalled();
  });
});
