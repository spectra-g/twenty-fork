import { act, renderHook, waitFor } from '@testing-library/react';

import { useCompanyCreateWithDuplicateWarning } from '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/useCompanyCreateWithDuplicateWarning';
import { AppPath } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

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

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'new-company-id'),
}));

const mockCreateCompanyWithoutPersistence =
  jest.requireMock(
    '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.stub',
  ).createCompanyWithoutPersistence as jest.Mock;

const mockFindCompanyCreateDuplicateCandidates =
  jest.requireMock(
    '@/action-menu/actions/record-actions/no-selection/components/company-create-duplicate-warning/companyCreateDuplicateWarning.stub',
  ).findCompanyCreateDuplicateCandidates as jest.Mock;

const mockUseNavigateApp = jest.requireMock(
  '~/hooks/useNavigateApp',
).useNavigateApp as jest.Mock;

describe('useCompanyCreateWithDuplicateWarning', () => {
  const mockNavigate = jest.fn();
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseNavigateApp.mockReturnValue(mockNavigate);
    mockCreateCompanyWithoutPersistence.mockResolvedValue({
      id: 'new-company-id',
    });
  });

  it('should expose duplicate candidates after the duplicate check resolves', async () => {
    mockFindCompanyCreateDuplicateCandidates.mockResolvedValue([
      {
        id: 'existing-company-1',
        name: 'Acme Corp',
        domainName: {
          primaryLinkUrl: 'https://acme.com',
        },
      },
    ]);

    const { result } = renderHook(() =>
      useCompanyCreateWithDuplicateWarning({
        objectMetadataItem,
      }),
    );

    await act(async () => {
      await result.current.startCreateFlow();
    });

    await waitFor(() => {
      expect(result.current.warningState.isOpen).toBe(true);
      expect(result.current.warningState.isLoading).toBe(false);
      expect(result.current.warningState.candidates).toEqual([
        {
          id: 'existing-company-1',
          name: 'Acme Corp',
          domainName: {
            primaryLinkUrl: 'https://acme.com',
          },
        },
      ]);
    });
  });

  it('should navigate to an existing company when a duplicate candidate is opened', () => {
    const { result } = renderHook(() =>
      useCompanyCreateWithDuplicateWarning({
        objectMetadataItem,
      }),
    );

    act(() => {
      result.current.openExistingCompany({
        id: 'existing-company-1',
        name: 'Acme Corp',
        domainName: {
          primaryLinkUrl: 'https://acme.com',
        },
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith(AppPath.RecordShowPage, {
      objectNameSingular: 'company',
      objectRecordId: 'existing-company-1',
    });
  });

  it('should navigate to the new company show page when no duplicates are found', async () => {
    mockFindCompanyCreateDuplicateCandidates.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useCompanyCreateWithDuplicateWarning({
        objectMetadataItem,
      }),
    );

    await act(async () => {
      await result.current.startCreateFlow();
    });

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

  it('should keep the warning open in loading state while duplicate candidates are being fetched', async () => {
    let resolveDuplicateCheck: ((value: []) => void) | undefined;

    mockFindCompanyCreateDuplicateCandidates.mockReturnValue(
      new Promise((resolve) => {
        resolveDuplicateCheck = resolve;
      }),
    );

    const { result } = renderHook(() =>
      useCompanyCreateWithDuplicateWarning({
        objectMetadataItem,
      }),
    );

    act(() => {
      void result.current.startCreateFlow();
    });

    expect(result.current.warningState).toEqual({
      candidates: [],
      isLoading: true,
      isOpen: true,
    });

    await act(async () => {
      resolveDuplicateCheck?.([]);
    });

    await waitFor(() => {
      expect(mockCreateCompanyWithoutPersistence).toHaveBeenCalledWith({
        id: 'new-company-id',
      });
    });
  });
});
