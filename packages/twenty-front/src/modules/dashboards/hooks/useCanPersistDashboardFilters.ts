import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanPersistDashboardFilters = () => {
  const canPersistDashboardFilters = useHasPermissionFlag(
    PermissionFlagType.LAYOUTS,
  );

  return { canPersistDashboardFilters };
};
