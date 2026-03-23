import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

describe('BlocklistValidationService', () => {
  it('should return create payload unchanged when description is present', async () => {
    const service = new BlocklistValidationService(
      {} as never,
      {} as never,
    );
    const payload = {
      data: [
        {
          handle: 'person@example.com',
          description: 'Keep this description',
          workspaceMemberId: 'workspace-member-id',
          id: 'blocklist-id',
          createdAt: '2026-03-23T00:00:00.000Z',
          updatedAt: '2026-03-23T00:00:00.000Z',
        },
      ],
    };

    jest.spyOn(service, 'validateSchema').mockResolvedValue(undefined);
    jest
      .spyOn(service, 'validateUniquenessForCreateMany')
      .mockResolvedValue(undefined);

    await expect(
      service.validateBlocklistForCreateMany(
        payload,
        'user-id',
        'workspace-id',
      ),
    ).resolves.toEqual(payload);
  });

  it('should return update payload unchanged when description is present', async () => {
    const service = new BlocklistValidationService(
      {} as never,
      {} as never,
    );
    const payload = {
      id: 'blocklist-id',
      data: {
        handle: 'person@example.com',
        description: 'Keep this updated description',
        workspaceMemberId: 'workspace-member-id',
        createdAt: '2026-03-23T00:00:00.000Z',
        updatedAt: '2026-03-23T00:00:00.000Z',
      },
    };

    jest.spyOn(service, 'validateSchema').mockResolvedValue(undefined);
    jest
      .spyOn(service, 'validateUniquenessForUpdateOne')
      .mockResolvedValue(undefined);

    await expect(
      service.validateBlocklistForUpdateOne(payload, 'user-id', 'workspace-id'),
    ).resolves.toEqual(payload);
  });
});
