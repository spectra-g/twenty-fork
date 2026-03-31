import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useDashboardFilters } from '@/dashboards/hooks/useDashboardFilters';
import { getDashboardFilterStageOptions } from '@/page-layout/widgets/utils/widgetFilterApplicability';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import styled from '@emotion/styled';
import { type Locale } from 'date-fns';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';

const StyledContainer = styled.div`
  align-items: end;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 8px;
`;

const StyledField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledInput = styled.input`
  border: 1px solid #d0d4dc;
  border-radius: 4px;
  padding: 8px;
`;

const StyledSelect = styled.select`
  border: 1px solid #d0d4dc;
  border-radius: 4px;
  padding: 8px;
`;

const StyledDateRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledDateRangeInputs = styled.div`
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const formatFilterDate = ({
  value,
  dateFormat,
  localeCatalog,
}: {
  value: string | null;
  dateFormat: ReturnType<typeof useDateTimeFormat>['dateFormat'];
  localeCatalog: Locale;
}) => {
  if (value === null) {
    return '';
  }

  return formatDateString({
    value,
    timeZone: 'UTC',
    dateFormat,
    localeCatalog,
  });
};

type DashboardFilterBarProps = {
  pageLayoutId: string;
};

export const DashboardFilterBar = ({
  pageLayoutId,
}: DashboardFilterBarProps) => {
  const workspaceMembers = useAtomStateValue(currentWorkspaceMembersState);
  const { dateFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { filters, setOwnerId, setStartDate, setEndDate, setStage } =
    useDashboardFilters(pageLayoutId);

  const formattedStartDate = formatFilterDate({
    value: filters.startDate,
    dateFormat,
    localeCatalog,
  });
  const formattedEndDate = formatFilterDate({
    value: filters.endDate,
    dateFormat,
    localeCatalog,
  });
  const stageOptions = getDashboardFilterStageOptions();

  const dateRangeLabel =
    filters.startDate !== null && filters.endDate !== null
      ? `${formattedStartDate} - ${formattedEndDate}`
      : formattedStartDate || formattedEndDate || 'No date range';

  return (
    <StyledContainer data-testid="dashboard-filter-bar">
      <StyledField>
        <span>Owner</span>
        <StyledSelect
          data-testid="owner-filter-dropdown"
          aria-label="Owner"
          value={filters.ownerId ?? ''}
          onChange={(event) => setOwnerId(event.target.value)}
        >
          <option value="">All owners</option>
          {workspaceMembers.map((workspaceMember) => (
            <option key={workspaceMember.id} value={workspaceMember.id}>
              {`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()}
            </option>
          ))}
        </StyledSelect>
      </StyledField>

      <StyledField data-testid="date-range-filter">
        <span>Date Range</span>
        <StyledDateRangeContainer>
          <StyledDateRangeInputs>
            <StyledInput
              data-testid="date-range-start-input"
              aria-label="Start date"
              type="date"
              value={filters.startDate ?? ''}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <StyledInput
              data-testid="date-range-end-input"
              aria-label="End date"
              type="date"
              value={filters.endDate ?? ''}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </StyledDateRangeInputs>
          <span data-testid="date-range-filter-value">{dateRangeLabel}</span>
        </StyledDateRangeContainer>
      </StyledField>

      <StyledField>
        <span>Stage</span>
        <StyledSelect
          data-testid="stage-filter"
          aria-label="Stage"
          value={filters.stage ?? ''}
          onChange={(event) => setStage(event.target.value)}
        >
          <option value="">All stages</option>
          {stageOptions.map((stageOption) => (
            <option key={stageOption} value={stageOption}>
              {stageOption}
            </option>
          ))}
        </StyledSelect>
      </StyledField>
    </StyledContainer>
  );
};
