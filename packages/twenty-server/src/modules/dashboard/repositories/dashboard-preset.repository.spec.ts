import { IsNull } from 'typeorm';

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
});
