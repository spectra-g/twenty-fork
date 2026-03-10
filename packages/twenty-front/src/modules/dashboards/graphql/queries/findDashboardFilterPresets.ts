import { gql } from '@apollo/client';

export const FIND_DASHBOARD_FILTER_PRESETS = gql`
  query FindDashboardFilterPresets($dashboardId: UUID!) {
    dashboardFilterPresets(dashboardId: $dashboardId) {
      id
      name
    }
  }
`;
