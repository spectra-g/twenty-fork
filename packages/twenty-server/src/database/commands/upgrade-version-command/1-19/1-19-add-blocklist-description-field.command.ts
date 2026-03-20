import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000 } from 'src/database/commands/upgrade-version-command/workspace-migrations/1772000000000-add-blocklist-description-field-to-standard-objects';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-4be3-44a7-9871-5f5e5d3c0d51';

@Command({
  name: 'upgrade:1-19:add-blocklist-description-field',
  description:
    'Add the missing Blocklist description field to standard objects',
})
export class AddBlocklistDescriptionFieldCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  private async hasAlreadyRun(workspaceId: string): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER
      ],
    );
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Adding Blocklist description field in workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would add the Blocklist description field in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    if (await this.hasAlreadyRun(workspaceId)) {
      this.logger.log(
        `Migration already applied for workspace ${workspaceId}, skipping.`,
      );

      return;
    }

    await this.workspaceMigrationRunnerService.run({
      workspaceId,
      workspaceMigration:
        ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000,
    });

    this.logger.log(
      `Successfully added the Blocklist description field in workspace ${workspaceId}`,
    );
  }
}
