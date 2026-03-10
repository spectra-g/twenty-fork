import { gql } from '@apollo/client';

export const DELETE_DASHBOARD_FILTER_PRESET = gql`
  mutation DeleteDashboardFilterPreset($id: UUID!) {
    deleteDashboardFilterPreset(id: $id)
  }
`;
