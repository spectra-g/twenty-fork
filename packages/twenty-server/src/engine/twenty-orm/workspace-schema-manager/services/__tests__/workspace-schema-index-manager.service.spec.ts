import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';

describe('WorkspaceSchemaIndexManagerService', () => {
  it('should create a GIN index with a trigram operator class when provided', async () => {
    const queryRunner = {
      query: jest.fn(),
    };
    const service = new WorkspaceSchemaIndexManagerService();

    await service.createIndex({
      queryRunner: queryRunner as never,
      schemaName: 'workspace_test',
      tableName: 'company',
      index: {
        name: 'IDX_company_name_trgm',
        columns: ['name'],
        columnOperatorClasses: ['gin_trgm_ops'],
        type: 'GIN',
      },
    });

    expect(queryRunner.query).toHaveBeenCalledWith(
      'CREATE INDEX IF NOT EXISTS "IDX_company_name_trgm" ON "workspace_test"."company" USING GIN ("name" gin_trgm_ops)',
    );
  });
});
