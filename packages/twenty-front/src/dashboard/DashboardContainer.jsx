import React from 'react';

import { loadDashboardData } from './api';
import { FilterPanel } from './FilterPanel';
import { WidgetContainer } from './WidgetContainer';
import {
  DEFAULT_ALLOWED_FILTER_KEYS,
  applyGlobalFilterUpdate,
  composeFilters,
  deserializeFromUrl,
  updateUrl,
} from './filterState';

const WIDGET_CONFIGS = [
  {
    id: 'pipeline',
    title: 'Pipeline Widget',
    localFilters: { status: 'open' },
  },
  {
    id: 'performance',
    title: 'Performance Widget',
    localFilters: { category: 'sales' },
  },
];

export const DashboardContainer = () => {
  const [globalFilters, setGlobalFilters] = React.useState(() => {
    return deserializeFromUrl(window.location.search, {
      allowedKeys: DEFAULT_ALLOWED_FILTER_KEYS,
      defaults: {},
    });
  });

  const [widgetData, setWidgetData] = React.useState({});

  React.useEffect(() => {
    updateUrl(globalFilters);
  }, [globalFilters]);

  React.useEffect(() => {
    let isActive = true;

    Promise.all(
      WIDGET_CONFIGS.map(async (widget) => {
        const composed = composeFilters(globalFilters, widget.localFilters);
        const data = await loadDashboardData({
          globalFilters,
          composedFilters: composed,
        });

        return [widget.id, data];
      }),
    ).then((entries) => {
      if (!isActive) {
        return;
      }

      setWidgetData(Object.fromEntries(entries));
    });

    return () => {
      isActive = false;
    };
  }, [globalFilters]);

  const onFilterChange = React.useCallback((key, value) => {
    setGlobalFilters((currentFilters) => {
      return applyGlobalFilterUpdate(currentFilters, key, value, {
        allowedKeys: DEFAULT_ALLOWED_FILTER_KEYS,
      });
    });
  }, []);

  return (
    <main>
      <h1>Dashboard</h1>
      <div>
        <FilterPanel
          globalFilters={globalFilters}
          onFilterChange={onFilterChange}
        />

        <div aria-label="widget-grid">
          {WIDGET_CONFIGS.map((widget) => {
            return (
              <WidgetContainer
                key={widget.id}
                widgetId={widget.id}
                globalFilters={globalFilters}
                localFilters={widget.localFilters}
                data={widgetData[widget.id]}
                render={({ filters, data }) => {
                  return (
                    <article>
                      <h3>{widget.title}</h3>
                      <p>{JSON.stringify(filters)}</p>
                      <p>{JSON.stringify(data ?? {})}</p>
                    </article>
                  );
                }}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
};
