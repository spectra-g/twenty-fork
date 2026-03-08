import express, { type Request } from 'express';

type SupportedOperator = 'eq' | 'neq' | 'in' | 'gt' | 'lt';

interface DashboardFilter {
  field: string;
  operator: SupportedOperator;
  value: unknown;
  expiresAt?: string;
}

interface ValidationError {
  path: string;
  message: string;
}

const SUPPORTED_OPERATORS: SupportedOperator[] = ['eq', 'neq', 'in', 'gt', 'lt'];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isScalar = (value: unknown) =>
  ['string', 'number', 'boolean'].includes(typeof value);

const parseDateString = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const validateFilter = (
  value: unknown,
  index: number,
): { filter: DashboardFilter | null; errors: ValidationError[] } => {
  if (!isPlainObject(value)) {
    return {
      filter: null,
      errors: [
        {
          path: `filters[${index}]`,
          message: 'Filter must be an object',
        },
      ],
    };
  }

  const errors: ValidationError[] = [];
  const field = typeof value.field === 'string' ? value.field.trim() : '';
  const rawOperator = typeof value.operator === 'string' ? value.operator : '';
  const operator = rawOperator.toLowerCase() as SupportedOperator;
  const filterValue = value.value;
  const expiresAt =
    typeof value.expiresAt === 'string' ? value.expiresAt : undefined;

  if (!field) {
    errors.push({
      path: `filters[${index}].field`,
      message: 'Field is required',
    });
  }

  if (!SUPPORTED_OPERATORS.includes(operator)) {
    errors.push({
      path: `filters[${index}].operator`,
      message: `Operator must be one of: ${SUPPORTED_OPERATORS.join(', ')}`,
    });
  } else if (operator === 'in') {
    if (!Array.isArray(filterValue) || filterValue.length === 0) {
      errors.push({
        path: `filters[${index}].value`,
        message: 'Operator "in" requires a non-empty array value',
      });
    }
  } else if (!isScalar(filterValue)) {
    errors.push({
      path: `filters[${index}].value`,
      message: `Operator "${operator}" requires a scalar value`,
    });
  }

  if (expiresAt !== undefined && !parseDateString(expiresAt)) {
    errors.push({
      path: `filters[${index}].expiresAt`,
      message: 'expiresAt must be a valid ISO date string',
    });
  }

  if (errors.length > 0) {
    return { filter: null, errors };
  }

  return {
    filter: {
      field,
      operator,
      value: filterValue,
      ...(expiresAt ? { expiresAt } : {}),
    },
    errors: [],
  };
};

const validateFilters = (
  filters: unknown,
): { filters: DashboardFilter[]; errors: ValidationError[] } => {
  if (!Array.isArray(filters)) {
    return {
      filters: [],
      errors: [
        {
          path: 'filters',
          message: 'filters must be an array',
        },
      ],
    };
  }

  return filters.reduce(
    (accumulator, filter, index) => {
      const result = validateFilter(filter, index);

      if (result.filter) {
        accumulator.filters.push(result.filter);
      }

      accumulator.errors.push(...result.errors);

      return accumulator;
    },
    { filters: [] as DashboardFilter[], errors: [] as ValidationError[] },
  );
};

const isExpired = (filter: DashboardFilter, now: Date) => {
  if (!filter.expiresAt) {
    return false;
  }

  const parsedDate = parseDateString(filter.expiresAt);

  return parsedDate !== null && parsedDate.getTime() <= now.getTime();
};

const getFiltersFromQuery = (request: Request) => {
  const rawFilters = request.query.filters;

  if (rawFilters === undefined) {
    return { filters: [] as DashboardFilter[], errors: [] as ValidationError[] };
  }

  if (typeof rawFilters !== 'string') {
    return {
      filters: [],
      errors: [{ path: 'filters', message: 'filters query param must be a JSON string' }],
    };
  }

  try {
    const parsed = JSON.parse(rawFilters);

    return validateFilters(parsed);
  } catch {
    return {
      filters: [],
      errors: [{ path: 'filters', message: 'filters query param must contain valid JSON' }],
    };
  }
};

export const dashboardRouter = express.Router();

dashboardRouter.post('/:id/filters', (request, response) => {
  const { filters, errors } = validateFilters(request.body?.filters);

  if (errors.length > 0) {
    response.status(400).json({
      errors,
    });

    return;
  }

  const now = new Date();
  const activeFilters = filters.filter((filter) => !isExpired(filter, now));

  response.status(200).json({
    dashboardId: request.params.id,
    sanitized: true,
    appliedFilters: activeFilters,
    appliedAt: now.toISOString(),
  });
});

dashboardRouter.get('/:id/data', (request, response) => {
  const { filters, errors } = getFiltersFromQuery(request);

  if (errors.length > 0) {
    response.status(400).json({ errors });

    return;
  }

  const now = new Date();
  const expiredFilters = filters.filter((filter) => isExpired(filter, now));
  const activeFilters = filters.filter((filter) => !isExpired(filter, now));

  response.status(200).json({
    dashboardId: request.params.id,
    appliedFilters: activeFilters,
    ignoredExpiredFilters: expiredFilters.length,
    data: [
      {
        id: 'record-1',
        label: 'Filtered dashboard data',
      },
    ],
  });
});
