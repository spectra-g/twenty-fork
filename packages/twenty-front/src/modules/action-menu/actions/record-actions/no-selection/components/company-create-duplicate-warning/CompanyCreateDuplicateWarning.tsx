import { t } from '@lingui/core/macro';

import {
  type CompanyCreateDuplicateCandidate,
  type CompanyCreateDuplicateWarningState,
} from '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.types';

type CompanyCreateDuplicateWarningProps = {
  onCandidateClick: (candidate: CompanyCreateDuplicateCandidate) => void;
  onClose: () => void;
  onContinueAnyway: () => void;
  warningState: CompanyCreateDuplicateWarningState;
};

export const CompanyCreateDuplicateWarning = ({
  onCandidateClick,
  onClose,
  onContinueAnyway,
  warningState,
}: CompanyCreateDuplicateWarningProps) => {
  if (!warningState.isOpen) {
    return null;
  }

  return (
    <section aria-label="Company duplicate warning">
      <h2>
        {warningState.isLoading
          ? t`Checking for duplicate companies`
          : t`Potential duplicate companies`}
      </h2>
      {warningState.isLoading ? (
        <div role="status">{t`Loading duplicate candidates`}</div>
      ) : (
        <>
          <p>{t`Review existing companies before creating a new one.`}</p>
          <ul>
            {warningState.candidates.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  onClick={() => onCandidateClick(candidate)}
                >
                  {candidate.name} ({candidate.domainName.primaryLinkUrl})
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onClose}>
            {t`Close`}
          </button>
          <button type="button" onClick={onContinueAnyway}>
            {t`Continue anyway`}
          </button>
        </>
      )}
    </section>
  );
};
