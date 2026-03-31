import { IsNull } from 'typeorm';
import { ViewVisibility } from 'twenty-shared/types';

import { DashboardPresetRepository } from 'src/modules/dashboard/repositories/dashboard-preset.repository';

describe('DashboardPresetRepository', () => {
  const mockTypeormRepository = {
    update: jest.fn(),
    softDelete: jest.fn(),
    find: jest.fn(),
  };

  let repository: DashboardPresetRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new DashboardPresetRepository(
      mockTypeormRepository as never,
    );
  });

  it('should rename a preset by updating only the name field', async () => {
    await repository.rename({
      id: 'preset-id',
      name: 'Q4 Deals',
    });

    expect(mockTypeormRepository.update).toHaveBeenCalledWith('preset-id', {
      name: 'Q4 Deals',
    });
  });

  it('should replace the filter payload without mutating other fields', async () => {
    const replacementFilter = {
      recordFilters: [],
      recordFilterGroups: [],
    };

    await repository.updateFilters({
      id: 'preset-id',
      filter: replacementFilter,
    });

    expect(mockTypeormRepository.update).toHaveBeenCalledWith('preset-id', {
      filter: replacementFilter,
    });
  });

  it('should soft-delete presets and separate active reads from withDeleted reads', async () => {
    mockTypeormRepository.find.mockResolvedValue([]);

    await repository.softDelete({ id: 'preset-id' });
    await repository.findActiveByPageLayoutId({
      pageLayoutId: 'page-layout-id',
    });
    await repository.findByPageLayoutIdIncludingDeleted({
      pageLayoutId: 'page-layout-id',
    });

    expect(mockTypeormRepository.softDelete).toHaveBeenCalledWith('preset-id');
    expect(mockTypeormRepository.find).toHaveBeenNthCalledWith(1, {
      where: {
        pageLayoutId: 'page-layout-id',
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'ASC',
      },
    });
    expect(mockTypeormRepository.find).toHaveBeenNthCalledWith(2, {
      where: {
        pageLayoutId: 'page-layout-id',
      },
      withDeleted: true,
      order: {
        createdAt: 'ASC',
      },
    });
  });

  it('should query WORKSPACE presets for other workspace members', async () => {
    mockTypeormRepository.find.mockResolvedValue([]);

    await repository.findAvailablePresets({
      workspaceId: 'workspace-id',
      userId: 'other-user-id',
    });

    expect(mockTypeormRepository.find).toHaveBeenCalledWith({
      where: [
        {
          workspaceId: 'workspace-id',
          visibility: ViewVisibility.WORKSPACE,
          deletedAt: IsNull(),
        },
        {
          workspaceId: 'workspace-id',
          creatorId: 'other-user-id',
          deletedAt: IsNull(),
        },
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  });

  it('should include creator-owned UNLISTED presets in the same availability query', async () => {
    const availablePresets = [{ id: 'preset-id' }];

    mockTypeormRepository.find.mockResolvedValue(availablePresets);

    await expect(
      repository.findAvailablePresets({
        workspaceId: 'workspace-id',
        userId: 'creator-id',
      }),
    ).resolves.toEqual(availablePresets);

    expect(mockTypeormRepository.find).toHaveBeenCalledWith({
      where: [
        {
          workspaceId: 'workspace-id',
          visibility: ViewVisibility.WORKSPACE,
          deletedAt: IsNull(),
        },
        {
          workspaceId: 'workspace-id',
          creatorId: 'creator-id',
          deletedAt: IsNull(),
        },
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  });
});
