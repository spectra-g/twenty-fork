import { gql } from '@apollo/client';

export const CREATE_DASHBOARD_PRESET = gql`
  mutation CreateDashboardPreset($input: CreateDashboardPresetInput!) {
    createDashboardPreset(input: $input) {
      id
      name
      filterState
    }
  }
`;
