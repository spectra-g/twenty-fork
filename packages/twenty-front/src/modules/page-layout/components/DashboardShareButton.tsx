import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

const StyledButton = styled.button`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  padding: 4px 8px;
`;

export const DashboardShareButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <StyledButton type="button" onClick={onClick}>
      {t`Share`}
    </StyledButton>
  );
};
