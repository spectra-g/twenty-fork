import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDashboardPresetsToPageLayout1775000000000
  implements MigrationInterface
{
  name = 'AddDashboardPresetsToPageLayout1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD "dashboardPresets" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP COLUMN "dashboardPresets"`,
    );
  }
}
