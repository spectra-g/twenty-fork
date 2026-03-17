import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { gql } from '@apollo/client';
import { useState } from 'react';

import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import {
  getMockCompanyObjectMetadataItem,
  getMockCompanyRecord,
} from '~/testing/mock-data/companies';

const mockCloseCommandMenu = jest.fn();
const mockOpenRecordInCommandMenu = jest.fn();
const mockCreateOneRecord = jest.fn();
const mockUpsertRecordsInStore = jest.fn();
const mockNavigate = jest.fn();
const mockOpenRecordTitleCell = jest.fn();
const mockApolloQuery = jest.fn();
const mockOpenModal = jest.fn();
const mockStoreGet = jest.fn();
const mockStoreSet = jest.fn();

jest.mock('@/command-menu/hooks/useCommandMenu', () => ({
  useCommandMenu: () => ({
    closeCommandMenu: mockCloseCommandMenu,
  }),
}));

jest.mock('@/command-menu/hooks/useOpenRecordInCommandMenu', () => ({
  useOpenRecordInCommandMenu: () => ({
    openRecordInCommandMenu: mockOpenRecordInCommandMenu,
  }),
}));

jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates', () => ({
  useBuildRecordInputFromRLSPredicates: () => ({
    buildRecordInputFromRLSPredicates: () => ({}),
  }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({
    createOneRecord: mockCreateOneRecord,
  }),
}));

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({
    upsertRecordsInStore: mockUpsertRecordsInStore,
  }),
}));

jest.mock(
  '@/object-record/record-table/hooks/useBuildRecordInputFromFilters',
  () => ({
    useBuildRecordInputFromFilters: () => ({
      buildRecordInputFromFilters: () => ({}),
    }),
  }),
);

jest.mock('@/object-record/record-title-cell/hooks/useRecordTitleCell', () => ({
  useRecordTitleCell: () => ({
    openRecordTitleCell: mockOpenRecordTitleCell,
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState',
  () => ({
    useAtomComponentFamilyStateCallbackState: () => () => 'group-state',
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => [],
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => undefined,
  }),
);

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({
    query: mockApolloQuery,
  }),
}));

jest.mock('@/object-record/hooks/useFindDuplicatesRecordsQuery', () => ({
  useFindDuplicateRecordsQuery: () => ({
    findDuplicateRecordsQuery: gql`
      query TestFindDuplicateCompany {
        companyDuplicates {
          edges {
            cursor
          }
        }
      }
    `,
  }),
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
  }),
}));

jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: ({
    title,
    subtitle,
    onClose,
    onConfirmClick,
    confirmButtonText,
  }: {
    title: string;
    subtitle: React.ReactNode;
    onClose?: () => void;
    onConfirmClick: () => void;
    confirmButtonText?: string;
  }) => (
    <div>
      <h1>{title}</h1>
      <div>{subtitle}</div>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onConfirmClick}>{confirmButtonText ?? 'Confirm'}</button>
    </div>
  ),
}));

jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({
    record,
  }: {
    record: {
      id: string;
      name?: string;
    };
  }) => <span>{record.name ?? record.id}</span>,
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigate,
}));

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: () => ({
    get: mockStoreGet,
    set: mockStoreSet,
  }),
}));

jest.mock('uuid', () => ({
  v4: () => 'created-record-id',
}));

const objectMetadataItem = getMockCompanyObjectMetadataItem();
const duplicateCompany = getMockCompanyRecord({
  id: 'duplicate-company-id',
  name: 'Acme Corp',
  domainName: {
    primaryLinkUrl: 'https://acme.com',
    primaryLinkLabel: 'acme.com',
    secondaryLinks: [],
    __typename: 'Links',
  },
});

const duplicateResponse = {
  data: {
    companyDuplicates: [
      {
        edges: [
          {
            cursor: 'duplicate-company-cursor',
            node: duplicateCompany,
          },
        ],
        pageInfo: {
          startCursor: 'duplicate-company-cursor',
          endCursor: 'duplicate-company-cursor',
          hasNextPage: false,
        },
      },
    ],
  },
};

const TestHarness = ({
  recordInput,
  onResult,
}: {
  recordInput: Record<string, unknown>;
  onResult: (result: unknown) => void;
}) => {
  const { createNewIndexRecord, duplicateWarningDialog } =
    useCreateNewIndexRecord({
      objectMetadataItem,
    });
  const [isCreating, setIsCreating] = useState(false);

  return (
    <>
      <button
        onClick={async () => {
          setIsCreating(true);
          onResult(await createNewIndexRecord(recordInput));
          setIsCreating(false);
        }}
      >
        Create
      </button>
      <span>{isCreating ? 'creating' : 'idle'}</span>
      {duplicateWarningDialog}
    </>
  );
};

describe('useCreateNewIndexRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockStoreGet.mockReturnValue(undefined);
    mockApolloQuery.mockResolvedValue(duplicateResponse);
    mockCreateOneRecord.mockResolvedValue({
      ...duplicateCompany,
      id: 'created-record-id',
    });
  });

  it('shows a warning before creating a duplicate company by name', async () => {
    const onResult = jest.fn();

    render(
      <TestHarness recordInput={{ name: 'Acme Corp' }} onResult={onResult} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            data: [{ name: 'Acme Corp' }],
          },
        }),
      );
    });

    expect(screen.getByText('Potential duplicate companies')).toBeVisible();
    expect(screen.getByText('Acme Corp')).toBeVisible();
    expect(mockCreateOneRecord).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });

  it('shows a warning before creating a duplicate company by domain', async () => {
    const onResult = jest.fn();

    render(
      <TestHarness
        recordInput={{
          domainName: {
            primaryLinkUrl: 'https://acme.com',
            primaryLinkLabel: 'acme.com',
          },
        }}
        onResult={onResult}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            data: [
              {
                domainName: {
                  primaryLinkUrl: 'https://acme.com',
                  primaryLinkLabel: 'acme.com',
                },
              },
            ],
          },
        }),
      );
    });

    expect(screen.getByText('Potential duplicate companies')).toBeVisible();
    expect(mockCreateOneRecord).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });

  it('cancels the create flow when the duplicate warning is dismissed', async () => {
    const onResult = jest.fn();

    render(
      <TestHarness recordInput={{ name: 'Acme Corp' }} onResult={onResult} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(null);
    });

    expect(mockCreateOneRecord).not.toHaveBeenCalled();
  });

  it('creates the company after create anyway is confirmed', async () => {
    const onResult = jest.fn();

    render(
      <TestHarness recordInput={{ name: 'Acme Corp' }} onResult={onResult} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Create anyway' }),
    );

    await waitFor(() => {
      expect(mockCreateOneRecord).toHaveBeenCalledWith({
        id: 'created-record-id',
        name: 'Acme Corp',
      });
    });

    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'created-record-id' }),
    );
  });

  it('re-checks duplicates on a later create attempt after create anyway', async () => {
    const onResult = jest.fn();

    render(
      <TestHarness recordInput={{ name: 'Acme Corp' }} onResult={onResult} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Create anyway' }),
    );

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'created-record-id' }),
      );
    });

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockApolloQuery).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText('Potential duplicate companies')).toBeVisible();
  });
});
