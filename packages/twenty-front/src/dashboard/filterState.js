const DEFAULT_ALLOWED_FILTER_KEYS = ['dateRange', 'category', 'status'];
const CATEGORY_VALUES = new Set(['sales', 'marketing']);
const STATUS_VALUES = new Set(['open', 'closed']);

const isPlainObject = (value) => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
};

const isValidFilterValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => item !== undefined && item !== null);
  }

  if (isPlainObject(value)) {
    return Object.values(value).every((item) => item !== undefined);
  }

  return false;
};

const isValidDateRange = (value) => {
  if (typeof value === 'string') {
    return value.length > 0;
  }

  if (!isPlainObject(value)) {
    return false;
  }

  if (typeof value.from !== 'string' || typeof value.to !== 'string') {
    return false;
  }

  return value.from.length > 0 && value.to.length > 0;
};

const DEFAULT_FILTER_VALIDATORS = {
  category: (value) => typeof value === 'string' && CATEGORY_VALUES.has(value),
  status: (value) => typeof value === 'string' && STATUS_VALUES.has(value),
  dateRange: (value) => isValidDateRange(value),
};

const parseFilterValue = (value) => {
  if (value === '') {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const deepMergeFilters = (globalFilters, localFilters) => {
  if (!isPlainObject(globalFilters) || !isPlainObject(localFilters)) {
    return localFilters;
  }

  const merged = { ...globalFilters };

  for (const [key, localValue] of Object.entries(localFilters)) {
    const globalValue = globalFilters[key];

    if (isPlainObject(globalValue) && isPlainObject(localValue)) {
      merged[key] = deepMergeFilters(globalValue, localValue);
      continue;
    }

    merged[key] = localValue;
  }

  return merged;
};

export const sanitizeFilters = (
  filters = {},
  {
    allowedKeys = DEFAULT_ALLOWED_FILTER_KEYS,
    defaults = {},
    validators = DEFAULT_FILTER_VALIDATORS,
  } = {},
) => {
  const allowedKeySet = new Set(allowedKeys);
  const sanitized = { ...defaults };

  for (const [key, value] of Object.entries(filters ?? {})) {
    if (!allowedKeySet.has(key)) {
      continue;
    }

    if (!isValidFilterValue(value)) {
      continue;
    }

    const validator = validators[key];
    if (validator && !validator(value)) {
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
};

export const applyGlobalFilterUpdate = (
  currentFilters,
  key,
  value,
  options,
) => {
  const allowedKeys = options?.allowedKeys ?? DEFAULT_ALLOWED_FILTER_KEYS;
  const validators = options?.validators ?? DEFAULT_FILTER_VALIDATORS;

  if (!allowedKeys.includes(key)) {
    return { ...currentFilters };
  }

  const nextFilters = { ...(currentFilters ?? {}) };

  if (value === undefined || value === null || value === '') {
    delete nextFilters[key];
    return nextFilters;
  }

  if (!isValidFilterValue(value)) {
    return nextFilters;
  }

  const validator = validators[key];
  if (validator && !validator(value)) {
    return nextFilters;
  }

  nextFilters[key] = value;
  return nextFilters;
};

export const composeFilters = (globalFilters = {}, widgetLocalFilters = {}) => {
  return deepMergeFilters(globalFilters ?? {}, widgetLocalFilters ?? {});
};

export const getComposedFilters = (globalFilters = {}, widgetLocalFilters = {}) => {
  return composeFilters(globalFilters, widgetLocalFilters);
};

export const serializeToUrl = (filters = {}) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string') {
      params.set(key, value);
      continue;
    }

    params.set(key, JSON.stringify(value));
  }

  return params.toString();
};

export const deserializeFromUrl = (searchString = '', options = {}) => {
  const params = new URLSearchParams(searchString);
  const parsed = {};

  for (const [key, value] of params.entries()) {
    parsed[key] = parseFilterValue(value);
  }

  return sanitizeFilters(parsed, options);
};

export const syncWithUrl = (options = {}) => {
  const searchString = window?.location?.search ?? '';
  return deserializeFromUrl(searchString, options);
};

export const updateUrl = (filters = {}) => {
  const searchParams = serializeToUrl(filters);
  const nextUrl = searchParams ? `?${searchParams}` : window.location.pathname;
  window.history.pushState({}, '', nextUrl);
};

export const createFilterState = (
  initialGlobalFilters = {},
  options = {},
) => {
  let globalFilters = sanitizeFilters(initialGlobalFilters, options);

  return {
    get globalFilters() {
      return globalFilters;
    },
    setGlobalFilter(key, value) {
      globalFilters = applyGlobalFilterUpdate(globalFilters, key, value, options);
      return globalFilters;
    },
    getComposedFilters(widgetLocalFilters) {
      return composeFilters(globalFilters, widgetLocalFilters);
    },
  };
};

export { DEFAULT_ALLOWED_FILTER_KEYS };
