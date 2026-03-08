import { type Request, type Response } from 'express';

import { createApp } from 'src/app';
import { dashboardRouter } from 'src/routes/dashboard';

type ResponseDouble = Response & {
  body?: unknown;
  statusCode?: number;
};

const getRouteHandler = (path: string, method: string) => {
  const routeLayer = dashboardRouter.stack.find(
    (layer) =>
      layer.route?.path === path && layer.route.methods[method] === true,
  );

  if (!routeLayer) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  }

  return routeLayer.route.stack[0].handle;
};

const buildRequest = (partial: Partial<Request>) => partial as Request;

const buildResponse = (): ResponseDouble => {
  const response = {
    statusCode: 200,
    body: undefined,
  } as ResponseDouble;

  response.status = jest.fn().mockImplementation((code: number) => {
    response.statusCode = code;

    return response;
  });

  response.json = jest.fn().mockImplementation((payload: unknown) => {
    response.body = payload;

    return response;
  });

  return response;
};

describe('dashboard routes', () => {
  it('POST /api/dashboard/:id/filters returns 200 with sanitized filters', () => {
    const handler = getRouteHandler('/:id/filters', 'post');
    const nowPlusOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const nowMinusOneHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const request = buildRequest({
      params: { id: 'db-1' },
      body: {
        filters: [
          {
            field: ' status ',
            operator: 'EQ',
            value: 'open',
            expiresAt: nowPlusOneHour,
          },
          {
            field: 'ownerId',
            operator: 'eq',
            value: 'user-1',
            expiresAt: nowMinusOneHour,
          },
        ],
      },
    });
    const response = buildResponse();

    handler(request, response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        dashboardId: 'db-1',
        sanitized: true,
        appliedFilters: [
          expect.objectContaining({
            field: 'status',
            operator: 'eq',
            value: 'open',
          }),
        ],
      }),
    );
  });

  it('GET /api/dashboard/:id/data returns filtered data and ignores expired filters', () => {
    const handler = getRouteHandler('/:id/data', 'get');
    const nowMinusOneHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const nowPlusOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const request = buildRequest({
      params: { id: 'db-2' },
      query: {
        filters: JSON.stringify([
          {
            field: 'stage',
            operator: 'eq',
            value: 'won',
            expiresAt: nowPlusOneHour,
          },
          {
            field: 'ownerId',
            operator: 'eq',
            value: 'user-1',
            expiresAt: nowMinusOneHour,
          },
        ]),
      },
    });
    const response = buildResponse();

    handler(request, response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        dashboardId: 'db-2',
        ignoredExpiredFilters: 1,
        appliedFilters: [
          expect.objectContaining({
            field: 'stage',
            operator: 'eq',
            value: 'won',
          }),
        ],
      }),
    );
  });

  it('POST /api/dashboard/:id/filters returns 400 on invalid values', () => {
    const handler = getRouteHandler('/:id/filters', 'post');
    const request = buildRequest({
      params: { id: 'db-3' },
      body: {
        filters: [
          {
            field: '',
            operator: 'between',
            value: {},
          },
        ],
      },
    });
    const response = buildResponse();

    handler(request, response);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ path: 'filters[0].field' }),
          expect.objectContaining({ path: 'filters[0].operator' }),
        ]),
      }),
    );
  });

  it('GET /api/dashboard/:id/data returns 400 for invalid filter query JSON', () => {
    const handler = getRouteHandler('/:id/data', 'get');
    const request = buildRequest({
      params: { id: 'db-4' },
      query: {
        filters: '{invalid-json',
      },
    });
    const response = buildResponse();

    handler(request, response);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: 'filters',
            message: expect.stringContaining('valid JSON'),
          }),
        ]),
      }),
    );
  });

  it('app mounts health and dashboard routes', () => {
    const app = createApp();
    const stack = (app as unknown as { _router: { stack: unknown[] } })._router
      .stack;
    const hasHealth = stack.some(
      (layer: { route?: { path?: string; methods?: Record<string, boolean> } }) =>
        layer.route?.path === '/healthz' && layer.route.methods?.get === true,
    );
    const dashboardMounts = stack.filter(
      (layer: { name?: string; regexp?: { toString: () => string } }) =>
        layer.name === 'router' &&
        layer.regexp?.toString().includes('api\\/dashboard'),
    );

    expect(hasHealth).toBe(true);
    expect(dashboardMounts.length).toBeGreaterThanOrEqual(2);
  });
});
