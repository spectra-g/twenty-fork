import { gql } from '@apollo/client';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';

import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import {
  getMockCompanyObjectMetadataItem,
  getMockCompanyRecord,
} from '~/testing/mock-data/companies';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockApolloQuery = jest.fn();
const mockRefetchQueries = jest.fn();
const mockCreateOneRecord = jest.fn();
const mockUpdateOneRecord = jest.fn();
const mockOpenRecordInCommandMenu = jest.fn();
const mockSetViewableRecordId = jest.fn();
const mockSetViewableRecordNameSingular = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({
    query: mockApolloQuery,
    refetchQueries: mockRefetchQueries,
  }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({
    createOneRecord: mockCreateOneRecord,
  }),
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: mockUpdateOneRecord,
  }),
}));

jest.mock('@/command-menu/hooks/useOpenRecordInCommandMenu', () => ({
  useOpenRecordInCommandMenu: () => ({
    openRecordInCommandMenu: mockOpenRecordInCommandMenu,
  }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: (atom: unknown) => {
    if (atom === viewableRecordIdState) {
      return mockSetViewableRecordId;
    }

    if (atom === viewableRecordNameSingularState) {
      return mockSetViewableRecordNameSingular;
    }

    return jest.fn();
  },
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

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}));

jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({
    record,
    onClick,
  }: {
    record: { id: string; name?: string };
    onClick?: () => void;
  }) => <button onClick={onClick}>{record.name ?? record.id}</button>,
}));

jest.mock('uuid', () => ({
  v4: () => 'created-record-id',
}));

const relationObjectMetadataItem = getMockCompanyObjectMetadataItem();
const objectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const fieldMetadataItem = {
  name: 'company',
} as never;
const relationFieldMetadataItem = {
  name: 'people',
  type: 'RELATION',
  settings: {},
} as never;

const duplicateCompany = getMockCompanyRecord({
  id: 'duplicate-company-id',
  name: 'Acme Corp',
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
  searchInput = 'Acme Corp',
  onResult,
}: {
  searchInput?: string;
  onResult: (result: unknown) => void;
}) => {
  const { createNewRecordAndOpenRightDrawer, duplicateWarningDialog } =
    useAddNewRecordAndOpenRightDrawer({
      fieldMetadataItem,
      objectMetadataItem,
      relationObjectMetadataNameSingular: 'company',
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId: 'person-id',
    });
  const [isCreating, setIsCreating] = useState(false);

  return (
    <>
      <button
        onClick={async () => {
          setIsCreating(true);
          onResult(await createNewRecordAndOpenRightDrawer?.(searchInput));
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

describe('useAddNewRecordAndOpenRightDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockApolloQuery.mockResolvedValue(duplicateResponse);
    mockCreateOneRecord.mockResolvedValue({
      ...duplicateCompany,
      id: 'created-record-id',
    });
  });

  it('shows a warning before creating a duplicate company from a relation picker', async () => {
    const onResult = jest.fn();

    render(<TestHarness onResult={onResult} />);

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

  it('cancels the relation create flow when the duplicate warning is dismissed', async () => {
    const onResult = jest.fn();

    render(<TestHarness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(null);
    });

    expect(mockCreateOneRecord).not.toHaveBeenCalled();
  });

  it('opens the selected duplicate company instead of creating a new relation record', async () => {
    const onResult = jest.fn();

    render(<TestHarness onResult={onResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await userEvent.click(screen.getByRole('button', { name: 'Acme Corp' }));

    await waitFor(() => {
      expect(mockSetViewableRecordId).toHaveBeenCalledWith(
        'duplicate-company-id',
      );
    });

    expect(mockSetViewableRecordNameSingular).toHaveBeenCalledWith('company');
    expect(mockOpenRecordInCommandMenu).toHaveBeenCalledWith({
      objectNameSingular: 'company',
      recordId: 'duplicate-company-id',
    });
    expect(mockCreateOneRecord).not.toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledWith(null);
  });

  it('creates the company after create anyway is confirmed', async () => {
    const onResult = jest.fn();

    render(<TestHarness onResult={onResult} />);

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

    expect(mockSetViewableRecordId).toHaveBeenCalledWith('created-record-id');
    expect(mockSetViewableRecordNameSingular).toHaveBeenCalledWith('company');
    expect(mockOpenRecordInCommandMenu).toHaveBeenCalledWith({
      objectNameSingular: 'company',
      recordId: 'created-record-id',
    });
    expect(onResult).toHaveBeenCalledWith('created-record-id');
  });
});
