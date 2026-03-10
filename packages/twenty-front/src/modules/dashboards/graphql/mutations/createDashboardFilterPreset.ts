import { gql } from '@apollo/client';

export const CREATE_DASHBOARD_FILTER_PRESET = gql`
  mutation CreateDashboardFilterPreset($dashboardId: UUID!, $name: String!) {
    createDashboardFilterPreset(dashboardId: $dashboardId, name: $name) {
      id
      name
    }
  }
`;
