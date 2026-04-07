import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDashboardPresetEntity1775563200000
  implements MigrationInterface
{
  name = 'AddDashboardPresetEntity1775563200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."dashboardPreset" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dashboardId" uuid NOT NULL, "name" character varying NOT NULL, "filter" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f978b04ab8f9b0df0b9a0c01ccb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_DASHBOARD_PRESET_DASHBOARD_ID" ON "core"."dashboardPreset" ("dashboardId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_DASHBOARD_PRESET_NAME_BY_DASHBOARD" ON "core"."dashboardPreset" ("dashboardId", "name") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DASHBOARD_PRESET_NAME_BY_DASHBOARD"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DASHBOARD_PRESET_DASHBOARD_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."dashboardPreset"`);
  }
}
