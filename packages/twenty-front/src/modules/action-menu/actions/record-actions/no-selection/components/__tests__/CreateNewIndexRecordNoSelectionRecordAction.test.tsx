import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateNewIndexRecordNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/CreateNewIndexRecordNoSelectionRecordAction';
import { AppPath } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('@/action-menu/actions/components/Action', () => ({
  Action: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      Create new record
    </button>
  ),
}));

jest.mock('@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow', () => ({
  useContextStoreObjectMetadataItemOrThrow: jest.fn(),
}));

jest.mock('@/object-record/record-table/hooks/useCreateNewIndexRecord', () => ({
  useCreateNewIndexRecord: jest.fn(() => ({
    createNewIndexRecord: jest.fn(),
  })),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: jest.fn(),
}));

jest.mock(
  '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.stub',
  () => ({
    createCompanyWithoutPersistence: jest.fn(),
    findCompanyCreateDuplicateCandidates: jest.fn(),
    getEmptyCompanyCreateDuplicateWarningState: jest.fn(() => ({
      candidates: [],
      isLoading: false,
      isOpen: false,
    })),
  }),
);

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'new-company-id'),
}));

const mockUseContextStoreObjectMetadataItemOrThrow =
  jest.requireMock(
    '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow',
  ).useContextStoreObjectMetadataItemOrThrow as jest.Mock;

const mockUseNavigateApp = jest.requireMock(
  '~/hooks/useNavigateApp',
).useNavigateApp as jest.Mock;

const mockFindCompanyCreateDuplicateCandidates =
  jest.requireMock(
    '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.stub',
  ).findCompanyCreateDuplicateCandidates as jest.Mock;

const mockCreateCompanyWithoutPersistence =
  jest.requireMock(
    '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.stub',
  ).createCompanyWithoutPersistence as jest.Mock;

describe('CreateNewIndexRecordNoSelectionRecordAction', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseContextStoreObjectMetadataItemOrThrow.mockReturnValue({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
    });
    mockUseNavigateApp.mockReturnValue(mockNavigate);
    mockCreateCompanyWithoutPersistence.mockResolvedValue({
      id: 'new-company-id',
    });
    mockFindCompanyCreateDuplicateCandidates.mockResolvedValue([
      {
        id: 'existing-company-1',
        name: 'Acme Corp',
        domainName: {
          primaryLinkUrl: 'https://acme.com',
        },
      },
    ]);
  });

  it('should display duplicate company candidates before persisting a new company', async () => {
    const user = userEvent.setup();

    render(<CreateNewIndexRecordNoSelectionRecordAction />);

    await user.click(screen.getByRole('button', { name: 'Create new record' }));

    expect(
      await screen.findByText('Potential duplicate companies'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acme Corp/i })).toBeVisible();
    expect(screen.getByText(/https:\/\/acme\.com/i)).toBeInTheDocument();
  });

  it('should navigate to an existing company from the duplicate warning', async () => {
    const user = userEvent.setup();

    render(<CreateNewIndexRecordNoSelectionRecordAction />);

    await user.click(screen.getByRole('button', { name: 'Create new record' }));
    await user.click(await screen.findByRole('button', { name: /Acme Corp/i }));

    expect(mockNavigate).toHaveBeenCalledWith(AppPath.RecordShowPage, {
      objectNameSingular: 'company',
      objectRecordId: 'existing-company-1',
    });
  });

  it('should navigate to the new company show page when no duplicates are found', async () => {
    const user = userEvent.setup();

    mockFindCompanyCreateDuplicateCandidates.mockResolvedValue([]);

    render(<CreateNewIndexRecordNoSelectionRecordAction />);

    await user.click(screen.getByRole('button', { name: 'Create new record' }));

    expect(mockCreateCompanyWithoutPersistence).toHaveBeenCalledWith({
      id: 'new-company-id',
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      AppPath.RecordShowPage,
      {
        objectNameSingular: 'company',
        objectRecordId: 'new-company-id',
      },
      undefined,
      {
        state: {
          isNewRecord: true,
          objectRecordId: 'new-company-id',
          labelIdentifierFieldName: 'name',
        },
      },
    );
  });

  it('should show a loading indicator while duplicate candidates are being checked', async () => {
    const user = userEvent.setup();
    let resolveDuplicateCheck:
      | ((value: Array<{ id: string; name: string; domainName: { primaryLinkUrl: string } }>) => void)
      | undefined;

    mockFindCompanyCreateDuplicateCandidates.mockReturnValue(
      new Promise((resolve) => {
        resolveDuplicateCheck = resolve;
      }),
    );

    render(<CreateNewIndexRecordNoSelectionRecordAction />);

    await user.click(screen.getByRole('button', { name: 'Create new record' }));

    expect(
      screen.getByText('Checking for duplicate companies'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: '' }),
    ).toHaveTextContent('Loading duplicate candidates');

    resolveDuplicateCheck?.([
      {
        id: 'existing-company-1',
        name: 'Acme Corp',
        domainName: {
          primaryLinkUrl: 'https://acme.com',
        },
      },
    ]);

    expect(
      await screen.findByText('Potential duplicate companies'),
    ).toBeInTheDocument();
  });
});
