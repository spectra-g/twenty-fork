/* eslint-disable @nx/enforce-module-boundaries */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { CreateDashboardPresetInput } from 'src/modules/dashboard/dtos/create-dashboard-preset.input';
import { UpdateDashboardPresetInput } from 'src/modules/dashboard/dtos/update-dashboard-preset.input';

const validFilter = {
  recordFilters: [
    {
      fieldMetadataId: 'status-field-id',
      operand: ViewFilterOperand.IS,
      type: FieldMetadataType.SELECT,
      value: 'OPEN',
    },
  ],
  recordFilterGroups: [],
};

const extractConstraintMessages = (errors: Awaited<ReturnType<typeof validate>>) =>
  errors.flatMap((error) => Object.values(error.constraints ?? {}));

describe('Dashboard preset input validation', () => {
  it('should reject an invalid create filter payload shape', async () => {
    const errors = await validate(
      plainToInstance(CreateDashboardPresetInput, {
        dashboardId: 'b1e6c8cb-dbe6-4784-af76-a244f83552df',
        name: 'Open deals',
        filter: {
          recordFilters: 'not-an-array',
          recordFilterGroups: [],
        },
      }),
    );

    expect(extractConstraintMessages(errors)).toContain(
      'filter must be a valid chart filter payload',
    );
  });

  it('should reject an invalid update filter payload shape', async () => {
    const errors = await validate(
      plainToInstance(UpdateDashboardPresetInput, {
        id: 'b1e6c8cb-dbe6-4784-af76-a244f83552df',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'status-field-id',
              operand: 'NOT_A_REAL_OPERAND',
            },
          ],
          recordFilterGroups: [],
        },
      }),
    );

    expect(extractConstraintMessages(errors)).toContain(
      'filter must be a valid chart filter payload',
    );
  });

  it('should accept a valid create payload', async () => {
    const errors = await validate(
      plainToInstance(CreateDashboardPresetInput, {
        dashboardId: 'b1e6c8cb-dbe6-4784-af76-a244f83552df',
        name: 'Open deals',
        filter: validFilter,
      }),
    );

    expect(errors).toEqual([]);
  });
});
