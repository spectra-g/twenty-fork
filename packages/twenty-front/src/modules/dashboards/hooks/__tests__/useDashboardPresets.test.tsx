import { useMutation, useQuery } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';

import { useDashboardPresets } from '@/dashboards/hooks/useDashboardPresets';

jest.mock('@apollo/client');

type RenamePresetMutationResponse = {
  data: {
    renameDashboardPreset: {
      preset: {
        id: string;
        name: string;
        canEdit: boolean;
        filterState: {
          ownerId: string;
        };
        lastUsedAt: string;
      };
      success: boolean;
    };
  };
};

describe('useDashboardPresets', () => {
  const renameMutation = jest.fn();
  const deleteMutation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useQuery as jest.Mock).mockReturnValue({
      data: {
        dashboardFiltersAndPresets: {
          presets: [
            {
              id: 'preset-1',
              name: 'Owned Pipeline Preset',
              canEdit: true,
              filterState: {
                ownerId: 'sales-team',
              },
              lastUsedAt: '2026-03-30T10:00:00.000Z',
            },
          ],
        },
      },
      loading: false,
    });
    let mutationCallCount = 0;

    (useMutation as jest.Mock).mockImplementation(() => {
      mutationCallCount += 1;

      return mutationCallCount % 2 === 1 ? [renameMutation] : [deleteMutation];
    });
  });

  it('should optimistically rename a preset before the mutation resolves', async () => {
    let resolveRenameMutation:
      | ((response: RenamePresetMutationResponse) => void)
      | undefined;

    renameMutation.mockReturnValue(
      new Promise<RenamePresetMutationResponse>((resolve) => {
        resolveRenameMutation = resolve;
      }),
    );

    const { result } = renderHook(() => useDashboardPresets('dashboard-a'));

    let renamePromise: Promise<void> | undefined;

    act(() => {
      renamePromise = result.current.renamePreset(
        'preset-1',
        'Renamed Pipeline Preset',
      );
    });

    expect(result.current.presets).toEqual([
      expect.objectContaining({
        id: 'preset-1',
        name: 'Renamed Pipeline Preset',
      }),
    ]);

    resolveRenameMutation?.({
      data: {
        renameDashboardPreset: {
          success: true,
          preset: {
            id: 'preset-1',
            name: 'Renamed Pipeline Preset',
            canEdit: true,
            filterState: {
              ownerId: 'sales-team',
            },
            lastUsedAt: '2026-03-30T10:00:00.000Z',
          },
        },
      },
    });
    await act(async () => {
      await renamePromise;
    });
  });

  it('should optimistically remove a preset before the delete mutation resolves', async () => {
    let resolveDeleteMutation: (() => void) | undefined;

    deleteMutation.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDeleteMutation = resolve;
      }),
    );

    const { result } = renderHook(() => useDashboardPresets('dashboard-a'));

    let deletePromise: Promise<void> | undefined;

    act(() => {
      deletePromise = result.current.deletePreset('preset-1');
    });

    expect(result.current.presets).toEqual([]);

    resolveDeleteMutation?.();
    await act(async () => {
      await deletePromise;
    });
  });
});
