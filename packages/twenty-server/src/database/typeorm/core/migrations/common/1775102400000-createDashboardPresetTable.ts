import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateDashboardPresetTable1775102400000
  implements MigrationInterface
{
  name = 'CreateDashboardPresetTable1775102400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "core"."dashboardPreset" (
        "workspaceId" uuid NOT NULL,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "dashboardId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "filterState" jsonb NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_DASHBOARD_PRESET_ID" PRIMARY KEY ("id"),
        CONSTRAINT "FK_DASHBOARD_PRESET_WORKSPACE_ID" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_DASHBOARD_PRESET_WORKSPACE_ID_DASHBOARD_ID"
      ON "core"."dashboardPreset" ("workspaceId", "dashboardId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "core"."IDX_DASHBOARD_PRESET_WORKSPACE_ID_DASHBOARD_ID"
    `);
    await queryRunner.query(`
      DROP TABLE "core"."dashboardPreset"
    `);
  }
}
