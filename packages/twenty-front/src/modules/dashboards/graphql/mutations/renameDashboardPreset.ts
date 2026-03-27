import { gql } from '@apollo/client';

export const RENAME_DASHBOARD_PRESET = gql`
  mutation RenameDashboardPreset($input: RenameDashboardPresetInput!) {
    renameDashboardPreset(input: $input) {
      id
      name
      filterState
    }
  }
`;
