import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { LightButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const DashboardFilterPresetDropdown = () => {
  return (
    <StyledContainer data-testid="dashboard-filter-preset-dropdown">
      <LightButton title={t`Save preset (coming soon)`} accent="tertiary">
        {t`Save preset`}
      </LightButton>
      <LightButton title={t`Rename preset (coming soon)`} accent="tertiary">
        {t`Rename`}
      </LightButton>
      <LightButton title={t`Delete preset (coming soon)`} accent="tertiary">
        {t`Delete`}
      </LightButton>
    </StyledContainer>
  );
};
