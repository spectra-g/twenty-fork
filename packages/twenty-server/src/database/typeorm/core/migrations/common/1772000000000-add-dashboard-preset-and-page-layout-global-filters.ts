import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDashboardPresetAndPageLayoutGlobalFilters1772000000000
  implements MigrationInterface
{
  name = 'AddDashboardPresetAndPageLayoutGlobalFilters1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD "globalFilters" jsonb`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."dashboardPreset_visibility_enum" AS ENUM('WORKSPACE', 'UNLISTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."dashboardPreset" ("universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pageLayoutId" uuid NOT NULL, "name" text NOT NULL DEFAULT '', "filter" jsonb NOT NULL, "creatorId" uuid NOT NULL, "visibility" "core"."dashboardPreset_visibility_enum" NOT NULL DEFAULT 'WORKSPACE', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a5bc789e44c885f6db7af2c8f96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fef18bdbf4cbd7108941c39b24" ON "core"."dashboardPreset" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_DASHBOARD_PRESET_WORKSPACE_ID_PAGE_LAYOUT_ID" ON "core"."dashboardPreset" ("workspaceId", "pageLayoutId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_DASHBOARD_PRESET_VISIBILITY" ON "core"."dashboardPreset" ("visibility") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dashboardPreset" ADD CONSTRAINT "FK_9d0b4eecff76d5df4b89d9c5b12" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dashboardPreset" ADD CONSTRAINT "FK_84da8ab0b0d4f8a0ed6f4af7c57" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dashboardPreset" ADD CONSTRAINT "FK_a94c52195f4472d7f8ee051c9dd" FOREIGN KEY ("pageLayoutId") REFERENCES "core"."pageLayout"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."dashboardPreset" DROP CONSTRAINT "FK_a94c52195f4472d7f8ee051c9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dashboardPreset" DROP CONSTRAINT "FK_84da8ab0b0d4f8a0ed6f4af7c57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dashboardPreset" DROP CONSTRAINT "FK_9d0b4eecff76d5df4b89d9c5b12"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DASHBOARD_PRESET_VISIBILITY"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DASHBOARD_PRESET_WORKSPACE_ID_PAGE_LAYOUT_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_fef18bdbf4cbd7108941c39b24"`,
    );
    await queryRunner.query(`DROP TABLE "core"."dashboardPreset"`);
    await queryRunner.query(`DROP TYPE "core"."dashboardPreset_visibility_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP COLUMN "globalFilters"`,
    );
  }
}
