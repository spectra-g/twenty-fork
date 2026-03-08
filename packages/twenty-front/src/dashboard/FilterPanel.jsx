import React from 'react';

const normalizeSelectValue = (value) => {
  if (value === '') {
    return undefined;
  }

  return value;
};

export const FilterPanel = ({ globalFilters, onFilterChange }) => {
  return (
    <aside aria-label="global-filter-panel">
      <h2>Global Filters</h2>
      <label htmlFor="filter-category">Category</label>
      <select
        id="filter-category"
        aria-label="Category"
        value={globalFilters.category ?? ''}
        onChange={(event) => {
          onFilterChange('category', normalizeSelectValue(event.target.value));
        }}
      >
        <option value="">All</option>
        <option value="sales">Sales</option>
        <option value="marketing">Marketing</option>
      </select>

      <label htmlFor="filter-status">Status</label>
      <select
        id="filter-status"
        aria-label="Status"
        value={globalFilters.status ?? ''}
        onChange={(event) => {
          onFilterChange('status', normalizeSelectValue(event.target.value));
        }}
      >
        <option value="">All</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>

      <label htmlFor="filter-date-range">Date Range</label>
      <input
        id="filter-date-range"
        aria-label="Date Range"
        type="text"
        placeholder="2026-01-01..2026-01-31"
        value={globalFilters.dateRange ?? ''}
        onChange={(event) => {
          onFilterChange('dateRange', normalizeSelectValue(event.target.value));
        }}
      />
    </aside>
  );
};
