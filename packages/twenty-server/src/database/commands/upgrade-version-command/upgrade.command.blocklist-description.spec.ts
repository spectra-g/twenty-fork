import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';

describe('UpgradeCommand blocklist description wiring', () => {
  it('should include the blocklist description migration in the 1.19 upgrade path', () => {
    const addBlocklistDescriptionFieldCommand = {
      runMigrationCommand: jest.fn(),
    };

    const upgradeCommand = new (UpgradeCommand as any)(
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      addBlocklistDescriptionFieldCommand,
    );

    expect(upgradeCommand.allCommands['1.19.0']).toHaveLength(6);
    expect(upgradeCommand.allCommands['1.19.0']).toContain(
      addBlocklistDescriptionFieldCommand,
    );
  });
});
