import { AddBlocklistDescriptionFieldCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-add-blocklist-description-field.command';
import { ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000 } from 'src/database/commands/upgrade-version-command/workspace-migrations/1772000000000-add-blocklist-description-field-to-standard-objects';

const BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-4be3-44a7-9871-5f5e5d3c0d51';

describe('AddBlocklistDescriptionFieldCommand', () => {
  it('should run the workspace migration when the blocklist description field is missing', async () => {
    const workspaceMigrationRunnerService = {
      run: jest.fn(),
    };
    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {},
        },
      }),
    };

    const command = new AddBlocklistDescriptionFieldCommand(
      {} as never,
      {} as never,
      {} as never,
      workspaceCacheService as never,
      workspaceMigrationRunnerService as never,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();

    await command.runOnWorkspace({
      workspaceId: 'workspace-id',
      options: { workspaceIds: [] },
      index: 0,
      total: 1,
    });

    expect(workspaceMigrationRunnerService.run).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceMigration:
        ADD_BLOCKLIST_DESCRIPTION_FIELD_TO_STANDARD_OBJECTS_1772000000000,
    });
  });

  it('should skip the workspace when the blocklist description field already exists', async () => {
    const workspaceMigrationRunnerService = {
      run: jest.fn(),
    };
    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [BLOCKLIST_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER]: {
              id: 'field-metadata-id',
            },
          },
        },
      }),
    };

    const command = new AddBlocklistDescriptionFieldCommand(
      {} as never,
      {} as never,
      {} as never,
      workspaceCacheService as never,
      workspaceMigrationRunnerService as never,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();

    await command.runOnWorkspace({
      workspaceId: 'workspace-id',
      options: { workspaceIds: [] },
      index: 0,
      total: 1,
    });

    expect(workspaceMigrationRunnerService.run).not.toHaveBeenCalled();
  });
});
