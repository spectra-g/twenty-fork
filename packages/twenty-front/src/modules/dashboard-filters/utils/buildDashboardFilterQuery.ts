import { type DashboardFilters } from '@/dashboard-filters/states/dashboardFilterState';
import { type ChartFilter } from 'twenty-shared/types';
import { ViewFilterOperand } from 'twenty-shared/types';

type DashboardFilterField = {
  id: string;
  name: string;
};

const OWNER_FIELD_NAMES = ['owner', 'assignedTo'];
const DATE_FIELD_NAMES = ['closeDate', 'createdAt'];
const STAGE_FIELD_NAMES = ['stage'];

const findFieldByCandidateNames = ({
  fields,
  candidateNames,
}: {
  fields: DashboardFilterField[];
  candidateNames: string[];
}) =>
  fields.find((field) => candidateNames.includes(field.name));

export const buildDashboardFilterQuery = ({
  dashboardFilters,
  fields,
}: {
  dashboardFilters: DashboardFilters;
  fields: DashboardFilterField[];
}): ChartFilter | undefined => {
  const recordFilters: NonNullable<ChartFilter['recordFilters']> = [];

  const ownerField = findFieldByCandidateNames({
    fields,
    candidateNames: OWNER_FIELD_NAMES,
  });

  if (dashboardFilters.ownerId !== '' && ownerField) {
    recordFilters.push({
      fieldMetadataId: ownerField.id,
      operand: ViewFilterOperand.IS,
      subFieldName: 'workspaceMemberId',
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [dashboardFilters.ownerId],
      }),
    });
  }

  const dateField = findFieldByCandidateNames({
    fields,
    candidateNames: DATE_FIELD_NAMES,
  });

  if (dashboardFilters.startDate !== '' && dateField) {
    recordFilters.push({
      fieldMetadataId: dateField.id,
      operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      value: dashboardFilters.startDate,
    });
  }

  if (dashboardFilters.endDate !== '' && dateField) {
    recordFilters.push({
      fieldMetadataId: dateField.id,
      operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
      value: dashboardFilters.endDate,
    });
  }

  const stageField = findFieldByCandidateNames({
    fields,
    candidateNames: STAGE_FIELD_NAMES,
  });

  if (dashboardFilters.stageId !== '' && stageField) {
    recordFilters.push({
      fieldMetadataId: stageField.id,
      operand: ViewFilterOperand.IS,
      value: dashboardFilters.stageId,
    });
  }

  if (recordFilters.length === 0) {
    return undefined;
  }

  return {
    recordFilters,
  };
};
