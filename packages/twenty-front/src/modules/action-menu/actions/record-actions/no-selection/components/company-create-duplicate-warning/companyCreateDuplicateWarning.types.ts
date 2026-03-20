export type CompanyCreateDuplicateCandidate = {
  id: string;
  name: string;
  domainName: {
    primaryLinkUrl: string;
  };
};

export type CompanyCreateDuplicateWarningState = {
  candidates: CompanyCreateDuplicateCandidate[];
  isLoading: boolean;
  isOpen: boolean;
};
