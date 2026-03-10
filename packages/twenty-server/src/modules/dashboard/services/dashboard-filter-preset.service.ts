import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CreateDashboardFilterPresetInput } from 'src/modules/dashboard/dtos/inputs/create-dashboard-filter-preset.input';
import { DashboardFilterPresetDTO } from 'src/modules/dashboard/dtos/dashboard-filter-preset.dto';
import {
  type DashboardFilterPresetRepository,
  type DashboardFilterPresetFilters,
} from 'src/modules/dashboard/repositories/dashboard-filter-preset.repository.interface';
import {
  DashboardException,
  DashboardExceptionCode,
  DashboardExceptionMessageKey,
  generateDashboardExceptionMessage,
} from 'src/modules/dashboard/exceptions/dashboard.exception';

export type DashboardExistenceChecker = {
  existsById(dashboardId: string): Promise<boolean>;
};

export const DASHBOARD_FILTER_PRESET_REPOSITORY = Symbol(
  'DASHBOARD_FILTER_PRESET_REPOSITORY',
);
export const DASHBOARD_EXISTENCE_CHECKER = Symbol('DASHBOARD_EXISTENCE_CHECKER');

@Injectable()
export class DashboardFilterPresetService {
  constructor(
    @Inject(DASHBOARD_FILTER_PRESET_REPOSITORY)
    private readonly dashboardFilterPresetRepository: DashboardFilterPresetRepository,
    @Inject(DASHBOARD_EXISTENCE_CHECKER)
    private readonly dashboardExistenceChecker: DashboardExistenceChecker,
  ) {}

  async createPreset(
    input: CreateDashboardFilterPresetInput,
  ): Promise<DashboardFilterPresetDTO> {
    this.assertValidFilterStructure(input.filter);

    const dashboardExists = await this.dashboardExistenceChecker.existsById(
      input.dashboardId,
    );

    if (!dashboardExists) {
      throw new DashboardException(
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.DASHBOARD_NOT_FOUND,
          input.dashboardId,
        ),
        DashboardExceptionCode.DASHBOARD_NOT_FOUND,
      );
    }

    const savedPreset = await this.dashboardFilterPresetRepository.save({
      dashboardId: input.dashboardId,
      name: input.name,
      filters: this.normalizeFilter(input.filter),
    });

    return {
      id: savedPreset.id,
      dashboardId: savedPreset.dashboardId,
      name: savedPreset.name,
      filter: savedPreset.filters,
      createdAt: savedPreset.createdAt,
      updatedAt: savedPreset.updatedAt,
    };
  }

  private assertValidFilterStructure(filter: Record<string, unknown>) {
    if (
      !filter ||
      typeof filter !== 'object' ||
      Array.isArray(filter) ||
      filter === null
    ) {
      throw new BadRequestException(
        'Invalid filter structure: expected a filter object.',
      );
    }

    const allowedKeys = new Set(['recordFilters', 'recordFilterGroups']);

    for (const key of Object.keys(filter)) {
      if (!allowedKeys.has(key)) {
        throw new BadRequestException(
          `Invalid filter structure: unsupported key "${key}".`,
        );
      }
    }

    const recordFilters = filter.recordFilters;
    const recordFilterGroups = filter.recordFilterGroups;

    if (recordFilters !== undefined && !Array.isArray(recordFilters)) {
      throw new BadRequestException(
        'Invalid filter structure: "recordFilters" must be an array.',
      );
    }

    if (recordFilterGroups !== undefined && !Array.isArray(recordFilterGroups)) {
      throw new BadRequestException(
        'Invalid filter structure: "recordFilterGroups" must be an array.',
      );
    }
  }

  private normalizeFilter(filter: Record<string, unknown>): DashboardFilterPresetFilters {
    return {
      recordFilters: Array.isArray(filter.recordFilters)
        ? filter.recordFilters
        : [],
      recordFilterGroups: Array.isArray(filter.recordFilterGroups)
        ? filter.recordFilterGroups
        : [],
    };
  }
}
