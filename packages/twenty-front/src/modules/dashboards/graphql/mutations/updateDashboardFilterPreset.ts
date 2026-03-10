import { gql } from '@apollo/client';

export const UPDATE_DASHBOARD_FILTER_PRESET = gql`
  mutation UpdateDashboardFilterPreset($id: UUID!, $name: String!) {
    updateDashboardFilterPreset(id: $id, name: $name) {
      id
      name
    }
  }
`;
