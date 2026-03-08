import { fireEvent, render, screen } from '@testing-library/react';

import { GlobalFilterBar } from '@/page-layout/components/GlobalFilterBar';
import { type FilterPreset } from '@/page-layout/types/PageLayoutConfig';

const presets: FilterPreset[] = [
  {
    id: 'default',
    name: 'Default',
    filters: [],
    filterGroups: [],
  },
  {
    id: 'recent',
    name: 'Recent',
    filters: [],
    filterGroups: [],
  },
];

describe('GlobalFilterBar', () => {
  it('changes active preset when editable', () => {
    const onPresetChange = jest.fn();

    render(
      <GlobalFilterBar
        presets={presets}
        activePresetId="default"
        canUpdate={true}
        onPresetChange={onPresetChange}
      />,
    );

    fireEvent.change(screen.getByTestId('global-filter-preset-select'), {
      target: { value: 'recent' },
    });

    expect(onPresetChange).toHaveBeenCalledWith('recent');
    expect(screen.getByTestId('global-filter-edit-controls')).toBeInTheDocument();
  });

  it('hides edit controls and disables preset picker in read-only mode', () => {
    render(
      <GlobalFilterBar
        presets={presets}
        activePresetId="default"
        canUpdate={false}
        onPresetChange={jest.fn()}
      />,
    );

    expect(screen.getByTestId('global-filter-preset-select')).toBeDisabled();
    expect(screen.queryByTestId('global-filter-edit-controls')).not.toBeInTheDocument();
  });
});
