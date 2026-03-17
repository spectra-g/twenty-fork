import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ActivatePgTrgmExtension1772000000000 implements MigrationInterface {
  name = 'ActivatePgTrgmExtension1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;`,
      );
    } catch {
      // Ignore error for environments where extension creation is restricted.
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally left blank. The extension may be shared by other features.
  }
}
