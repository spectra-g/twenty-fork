import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type WorkspaceRow = {
  id: string;
};

export class AddDashboardFilterColumns1772000000000
  implements MigrationInterface
{
  name = 'AddDashboardFilterColumns1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const workspaceRows = (await queryRunner.query(
      `SELECT "id" FROM "core"."workspace"`,
    )) as WorkspaceRow[];

    for (const workspaceRow of workspaceRows) {
      const schemaName = getWorkspaceSchemaName(workspaceRow.id);

      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."dashboard" ADD COLUMN IF NOT EXISTS "recordFilters" jsonb`,
      );
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."dashboard" ADD COLUMN IF NOT EXISTS "recordFilterGroups" jsonb`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const workspaceRows = (await queryRunner.query(
      `SELECT "id" FROM "core"."workspace"`,
    )) as WorkspaceRow[];

    for (const workspaceRow of workspaceRows) {
      const schemaName = getWorkspaceSchemaName(workspaceRow.id);

      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."dashboard" DROP COLUMN IF EXISTS "recordFilterGroups"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."dashboard" DROP COLUMN IF EXISTS "recordFilters"`,
      );
    }
  }
}
