import {
  type CompanyCreateDuplicateCandidate,
  type CompanyCreateDuplicateWarningState,
} from '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.types';

const COMPANY_CREATE_STUB_DELAY_MS = 100;

const waitForStubDelay = async () =>
  await new Promise((resolve) => {
    setTimeout(resolve, COMPANY_CREATE_STUB_DELAY_MS);
  });

const mockedDuplicateCandidates: CompanyCreateDuplicateCandidate[] = [
  {
    id: 'existing-company-1',
    name: 'Acme Corp',
    domainName: {
      primaryLinkUrl: 'https://acme.com',
    },
  },
  {
    id: 'existing-company-2',
    name: 'Acme Incorporated',
    domainName: {
      primaryLinkUrl: 'https://acme.co',
    },
  },
];

export const findCompanyCreateDuplicateCandidates = async (): Promise<
  CompanyCreateDuplicateCandidate[]
> => {
  await waitForStubDelay();

  return mockedDuplicateCandidates;
};

export const createCompanyWithoutPersistence = async ({
  id,
}: {
  id: string;
}): Promise<{ id: string }> => {
  await waitForStubDelay();

  return {
    id,
  };
};

export const getEmptyCompanyCreateDuplicateWarningState =
  (): CompanyCreateDuplicateWarningState => ({
    candidates: [],
    isLoading: false,
    isOpen: false,
  });
