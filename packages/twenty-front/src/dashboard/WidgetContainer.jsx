import React from 'react';

import { getComposedFilters } from './filterState';

export const WidgetContainer = ({
  widgetId,
  globalFilters,
  localFilters,
  data,
  render,
}) => {
  const composedFilters = React.useMemo(() => {
    return getComposedFilters(globalFilters, localFilters);
  }, [globalFilters, localFilters]);

  return (
    <section aria-label={`widget-${widgetId}`}>
      {render({ filters: composedFilters, data })}
    </section>
  );
};
