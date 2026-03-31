import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';
import { ViewVisibility } from 'twenty-shared/types';

import { DashboardPresetEntity } from 'src/engine/metadata-modules/dashboard-preset/entities/dashboard-preset.entity';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Injectable()
export class DashboardPresetRepository {
  constructor(
    @InjectRepository(DashboardPresetEntity)
    private readonly dashboardPresetEntityRepository: Repository<DashboardPresetEntity>,
  ) {}

  async rename({
    id,
    name,
  }: {
    id: string;
    name: string;
  }): Promise<void> {
    await this.dashboardPresetEntityRepository.update(id, { name });
  }

  async updateFilters({
    id,
    filter,
  }: {
    id: string;
    filter: JsonbProperty<Record<string, unknown>>;
  }): Promise<void> {
    await this.dashboardPresetEntityRepository.update(id, { filter });
  }

  async softDelete({ id }: { id: string }): Promise<void> {
    await this.dashboardPresetEntityRepository.softDelete(id);
  }

  async findActiveByPageLayoutId({
    pageLayoutId,
  }: {
    pageLayoutId: string;
  }): Promise<DashboardPresetEntity[]> {
    return this.dashboardPresetEntityRepository.find({
      where: {
        pageLayoutId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findByPageLayoutIdIncludingDeleted({
    pageLayoutId,
  }: {
    pageLayoutId: string;
  }): Promise<DashboardPresetEntity[]> {
    return this.dashboardPresetEntityRepository.find({
      where: {
        pageLayoutId,
      },
      withDeleted: true,
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findAvailablePresets({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<DashboardPresetEntity[]> {
    return this.dashboardPresetEntityRepository.find({
      where: [
        {
          workspaceId,
          visibility: ViewVisibility.WORKSPACE,
          deletedAt: IsNull(),
        },
        {
          workspaceId,
          creatorId: userId,
          deletedAt: IsNull(),
        },
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
