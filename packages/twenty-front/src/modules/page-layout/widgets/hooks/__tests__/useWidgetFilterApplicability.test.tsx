import { renderHook } from '@testing-library/react';
import { WidgetType } from '~/generated-metadata/graphql';

import { useWidgetFilterApplicability } from '@/page-layout/widgets/hooks/useWidgetFilterApplicability';

describe('useWidgetFilterApplicability', () => {
  it('returns owner, date, and stage support for graph widgets', () => {
    const { result } = renderHook(() =>
      useWidgetFilterApplicability(WidgetType.GRAPH),
    );

    expect(result.current.supportedDimensions).toEqual([
      'owner',
      'date',
      'stage',
    ]);
    expect(result.current.stageOptions).toEqual([
      'New',
      'Screening',
      'Meeting',
      'Proposal',
      'Customer',
    ]);
  });

  it('returns no supported dimensions for unsupported widget types', () => {
    const { result } = renderHook(() =>
      useWidgetFilterApplicability(WidgetType.NOTES),
    );

    expect(result.current.supportedDimensions).toEqual([]);
    expect(result.current.stageOptions).toEqual([]);
  });
});
