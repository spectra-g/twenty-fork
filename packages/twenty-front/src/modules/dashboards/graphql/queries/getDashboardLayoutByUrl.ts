import { PAGE_LAYOUT_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutFragment';
import { gql } from '@apollo/client';

export const GET_DASHBOARD_LAYOUT_BY_URL = gql`
  ${PAGE_LAYOUT_FRAGMENT}
  query GetDashboardLayoutByUrl($dashboardId: UUID!, $presetId: String) {
    getDashboardLayoutByUrl(dashboardId: $dashboardId, presetId: $presetId) {
      ...PageLayoutFragment
    }
  }
`;
