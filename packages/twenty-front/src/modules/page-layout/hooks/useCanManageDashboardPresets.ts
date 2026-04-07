/* eslint-disable @nx/enforce-module-boundaries */
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isDefined } from 'twenty-shared/utils';

export const useCanManageDashboardPresets = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const dashboardObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Dashboard,
  );

  if (!isDefined(dashboardObjectMetadataItem)) {
    return {
      canManageDashboardPresets: false,
    };
  }

  const dashboardObjectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    dashboardObjectMetadataItem.id,
  );

  return {
    canManageDashboardPresets:
      dashboardObjectPermissions.canUpdateObjectRecords,
  };
};
