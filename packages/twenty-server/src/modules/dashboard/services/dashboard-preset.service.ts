import { Injectable } from '@nestjs/common';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { DashboardPresetDTO } from 'src/modules/dashboard/dtos/dashboard-preset.dto';

@Injectable()
export class DashboardPresetService {
  async getPresetsForDashboard(
    dashboardId: string,
  ): Promise<DashboardPresetDTO[]> {
    void dashboardId;

    return [];
  }

  async getActiveFilterState(
    dashboardId: string,
  ): Promise<Record<string, unknown> | null> {
    void dashboardId;

    return null;
  }

  validateFilterState(filterState: Record<string, unknown> | null): {
    isValid: boolean;
  } {
    if (
      filterState === null ||
      Array.isArray(filterState) ||
      Object.keys(filterState).length === 0
    ) {
      throw new UserInputError('Filter state is required');
    }

    return { isValid: true };
  }

  async savePreset(
    dashboardId: string,
    name: string,
    filterState: Record<string, unknown> | null,
  ): Promise<DashboardPresetDTO> {
    void dashboardId;

    this.validateFilterState(filterState);

    return {
      id: 'stub-preset-id',
      name,
      filterState,
    };
  }
}
