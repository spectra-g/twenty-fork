jest.mock('twenty-shared/metadata', () => {
  const path = require('path');

  const { STANDARD_OBJECTS } = require(
    path.resolve(
      process.cwd(),
      'packages/twenty-shared/src/metadata/constants/standard-object.constant.ts',
    ),
  );

  return { STANDARD_OBJECTS };
});

import { FieldMetadataType } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildDashboardStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/compute-dashboard-standard-flat-field-metadata.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';

describe('buildDashboardStandardFlatFieldMetadatas', () => {
  it('defines persisted dashboard filter state fields with the expected metadata', () => {
    const relatedEntityIds = getStandardObjectMetadataRelatedEntityIds();

    const fields = buildDashboardStandardFlatFieldMetadatas({
      now: '2026-04-02T00:00:00.000Z',
      objectName: 'dashboard',
      workspaceId: 'workspace-id',
      standardObjectMetadataRelatedEntityIds: relatedEntityIds,
      dependencyFlatEntityMaps: {} as any,
      twentyStandardApplicationId: 'twenty-standard-application-id',
    });

    expect(STANDARD_OBJECTS.dashboard.fields.filterBarEnabled).toBeDefined();
    expect(STANDARD_OBJECTS.dashboard.fields.filterConfiguration).toBeDefined();

    expect(fields.filterBarEnabled).toMatchObject({
      id: relatedEntityIds.dashboard.fields.filterBarEnabled.id,
      type: FieldMetadataType.BOOLEAN,
      name: 'filterBarEnabled',
      defaultValue: false,
      isNullable: false,
    });

    expect(fields.filterConfiguration).toMatchObject({
      id: relatedEntityIds.dashboard.fields.filterConfiguration.id,
      type: FieldMetadataType.RAW_JSON,
      name: 'filterConfiguration',
      defaultValue: null,
      isNullable: true,
    });
  });
});
