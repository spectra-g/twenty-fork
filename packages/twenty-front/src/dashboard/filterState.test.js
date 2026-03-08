import {
  DEFAULT_ALLOWED_FILTER_KEYS,
  applyGlobalFilterUpdate,
  composeFilters,
  createFilterState,
  deserializeFromUrl,
  sanitizeFilters,
  serializeToUrl,
  syncWithUrl,
  updateUrl,
} from './filterState';

describe('filterState', () => {
  it('creates state factory with expected api', () => {
    const state = createFilterState();

    expect(state.globalFilters).toEqual({});
    expect(typeof state.setGlobalFilter).toBe('function');
    expect(typeof state.getComposedFilters).toBe('function');
  });

  it('setGlobalFilter updates global filters immutably and supports clearing', () => {
    const state = createFilterState({ category: 'sales' });
    const before = state.globalFilters;

    state.setGlobalFilter('status', 'open');

    expect(state.globalFilters).toEqual({ category: 'sales', status: 'open' });
    expect(state.globalFilters).not.toBe(before);

    state.setGlobalFilter('status', undefined);
    expect(state.globalFilters).toEqual({ category: 'sales' });
  });

  it('returns composed filters with local precedence and without mutating sources', () => {
    const global = {
      status: 'open',
      metadata: {
        team: 'north',
        region: 'uk',
      },
    };
    const local = {
      status: 'closed',
      metadata: {
        region: 'us',
      },
      category: 'sales',
    };
    const frozenGlobal = Object.freeze(structuredClone(global));
    const frozenLocal = Object.freeze(structuredClone(local));

    const composed = composeFilters(frozenGlobal, frozenLocal);

    expect(composed).toEqual({
      status: 'closed',
      metadata: {
        team: 'north',
        region: 'us',
      },
      category: 'sales',
    });
    expect(frozenGlobal).toEqual(global);
    expect(frozenLocal).toEqual(local);
  });

  it('serializes and deserializes URL filter state symmetrically', () => {
    const filters = {
      category: 'sales',
      status: 'open',
      dateRange: { from: '2026-01-01', to: '2026-01-31' },
    };

    const query = serializeToUrl(filters);
    const roundTrip = deserializeFromUrl(query);

    expect(query).toContain('category=sales');
    expect(roundTrip).toEqual(filters);
  });

  it('strips unknown and invalid URL values and applies defaults', () => {
    const result = deserializeFromUrl(
      '?category=sales&status=%7B%22broken%22&unknown=value',
      {
        allowedKeys: DEFAULT_ALLOWED_FILTER_KEYS,
        defaults: { status: 'open' },
      },
    );

    expect(result).toEqual({ category: 'sales', status: 'open' });
  });

  it('syncs filters from URL and updates browser history', () => {
    window.history.pushState({}, '', '/?status=open');

    const synced = syncWithUrl();
    expect(synced).toEqual({ status: 'open' });

    updateUrl({ category: 'marketing' });
    expect(window.location.search).toBe('?category=marketing');
  });

  it('returns empty filters for root path without params', () => {
    const parsed = deserializeFromUrl('', {
      allowedKeys: DEFAULT_ALLOWED_FILTER_KEYS,
      defaults: {},
    });

    expect(parsed).toEqual({});
  });

  it('applyGlobalFilterUpdate ignores unknown keys', () => {
    const next = applyGlobalFilterUpdate({}, 'unknown', 'value', {
      allowedKeys: DEFAULT_ALLOWED_FILTER_KEYS,
    });

    expect(next).toEqual({});
  });

  it('sanitizeFilters only keeps allowed keys with valid values', () => {
    const sanitized = sanitizeFilters(
      {
        category: 'sales',
        status: null,
        dateRange: { from: '2026-01-01', to: '2026-01-31' },
        legacy: 'ignored',
      },
      {
        allowedKeys: DEFAULT_ALLOWED_FILTER_KEYS,
        defaults: {},
      },
    );

    expect(sanitized).toEqual({
      category: 'sales',
      dateRange: { from: '2026-01-01', to: '2026-01-31' },
    });
  });
});
