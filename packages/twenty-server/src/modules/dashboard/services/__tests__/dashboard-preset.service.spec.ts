/* eslint-disable @nx/enforce-module-boundaries */
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { DashboardPresetService } from 'src/modules/dashboard/services/dashboard-preset.service';

describe('DashboardPresetService', () => {
  it('should keep stored presets isolated from caller-side mutations while supporting CRUD operations', async () => {
    const service = new DashboardPresetService();
    const dashboardId = 'b1e6c8cb-dbe6-4784-af76-a244f83552df';

    const createdPreset = await service.createPreset({
      dashboardId,
      name: 'Open deals',
      filter: {
        recordFilters: [
          {
            fieldMetadataId: 'status-field-id',
            operand: ViewFilterOperand.IS,
            type: FieldMetadataType.SELECT,
            value: 'OPEN',
          },
        ],
        recordFilterGroups: [],
      },
    });

    createdPreset.name = 'Mutated outside the service';
    createdPreset.filter.recordFilters = [];

    const listedPresets =
      await service.findAllPresetsByDashboardId(dashboardId);

    expect(listedPresets).toEqual([
      expect.objectContaining({
        id: createdPreset.id,
        name: 'Open deals',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'status-field-id',
              operand: ViewFilterOperand.IS,
              type: FieldMetadataType.SELECT,
              value: 'OPEN',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    ]);

    const updatedPreset = await service.updatePreset({
      id: createdPreset.id,
      name: 'Closed deals',
    });

    expect(updatedPreset.name).toBe('Closed deals');

    const deleted = await service.deletePreset(createdPreset.id);

    expect(deleted).toBe(true);
    expect(await service.findAllPresetsByDashboardId(dashboardId)).toEqual([]);
  });
});
