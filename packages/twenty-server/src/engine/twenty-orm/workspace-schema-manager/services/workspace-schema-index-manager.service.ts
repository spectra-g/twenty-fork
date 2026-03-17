import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { validateAndReturnIndexWhereClause } from 'src/engine/workspace-manager/workspace-migration/utils/validate-index-where-clause.util';

const ALLOWED_INDEX_TYPES = new Set([
  'BTREE',
  'HASH',
  'GIST',
  'SPGIST',
  'GIN',
  'BRIN',
]);
const ALLOWED_OPERATOR_CLASS = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export class WorkspaceSchemaIndexManagerService {
  async createIndex({
    queryRunner,
    schemaName,
    tableName,
    index,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    index: WorkspaceSchemaIndexDefinition;
  }): Promise<void> {
    const quotedColumns = index.columns.map((column, indexPosition) => {
      const operatorClass = index.columnOperatorClasses?.[indexPosition];

      if (!operatorClass) {
        return escapeIdentifier(column);
      }

      if (!ALLOWED_OPERATOR_CLASS.test(operatorClass)) {
        throw new Error(`Unsupported operator class: ${operatorClass}`);
      }

      return `${escapeIdentifier(column)} ${operatorClass}`;
    });
    const isUnique = index.isUnique ? 'UNIQUE' : '';

    let indexType = '';

    if (index.type && index.type !== 'BTREE') {
      if (!ALLOWED_INDEX_TYPES.has(index.type)) {
        throw new Error(`Unsupported index type: ${index.type}`);
      }
      indexType = `USING ${index.type}`;
    }

    const validatedWhereClause = validateAndReturnIndexWhereClause(index.where);
    const whereClause = validatedWhereClause
      ? `WHERE ${validatedWhereClause}`
      : '';

    const sql = [
      'CREATE',
      isUnique && 'UNIQUE',
      'INDEX IF NOT EXISTS',
      escapeIdentifier(index.name),
      'ON',
      `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`,
      indexType,
      `(${quotedColumns.join(', ')})`,
      whereClause,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    await queryRunner.query(sql);
  }

  async dropIndex({
    queryRunner,
    schemaName,
    indexName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    indexName: string;
  }): Promise<void> {
    const sql = `DROP INDEX IF EXISTS ${escapeIdentifier(schemaName)}.${escapeIdentifier(indexName)}`;

    await queryRunner.query(sql);
  }
}
