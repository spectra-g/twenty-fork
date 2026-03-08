import { type NextFunction, type Request, type Response } from 'express';

import { requireAuth } from 'src/routes/auth';
import { dashboardPresetsRouter } from 'src/routes/dashboardPresets';

type ResponseDouble = Response & {
  body?: unknown;
  statusCode?: number;
};

const getRouteHandler = (path: string, method: string) => {
  const routeLayer = dashboardPresetsRouter.stack.find(
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

describe('dashboard preset routes', () => {
  it('supports create, list, select, rename, and delete', () => {
    const createHandler = getRouteHandler('/:id/presets', 'post');
    const listHandler = getRouteHandler('/:id/presets', 'get');
    const selectHandler = getRouteHandler('/:id/presets/:presetId/select', 'post');
    const renameHandler = getRouteHandler('/:id/presets/:presetId', 'put');
    const deleteHandler = getRouteHandler('/:id/presets/:presetId', 'delete');

    const createRequest = buildRequest({
      params: { id: 'db-presets' },
      body: {
        name: 'My Preset',
        visibility: 'private',
        filters: [{ field: 'status', operator: 'eq', value: 'open' }],
      },
    });
    const createResponse = buildResponse();

    createHandler(createRequest, createResponse);

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body).toEqual(
      expect.objectContaining({
        preset: expect.objectContaining({
          id: expect.any(String),
          dashboardId: 'db-presets',
          name: 'My Preset',
          visibility: 'private',
        }),
      }),
    );

    const presetId = (createResponse.body as { preset: { id: string } }).preset.id;

    const listRequest = buildRequest({ params: { id: 'db-presets' } });
    const listResponse = buildResponse();

    listHandler(listRequest, listResponse);

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body).toEqual(
      expect.objectContaining({
        presets: expect.arrayContaining([
          expect.objectContaining({
            id: presetId,
          }),
        ]),
      }),
    );

    const renameRequest = buildRequest({
      params: { id: 'db-presets', presetId },
      body: { name: 'Renamed Preset' },
    });
    const renameResponse = buildResponse();

    renameHandler(renameRequest, renameResponse);

    expect(renameResponse.statusCode).toBe(200);
    expect(renameResponse.body).toEqual(
      expect.objectContaining({
        preset: expect.objectContaining({
          id: presetId,
          name: 'Renamed Preset',
        }),
      }),
    );

    const selectRequest = buildRequest({
      params: { id: 'db-presets', presetId },
    });
    const selectResponse = buildResponse();

    selectHandler(selectRequest, selectResponse);

    expect(selectResponse.statusCode).toBe(200);
    expect(selectResponse.body).toEqual({ activePresetId: presetId });

    const deleteRequest = buildRequest({
      params: { id: 'db-presets', presetId },
    });
    const deleteResponse = buildResponse();

    deleteHandler(deleteRequest, deleteResponse);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toEqual({ deletedPresetId: presetId });
  });

  it('validates visibility and returns a clear 400 response', () => {
    const createHandler = getRouteHandler('/:id/presets', 'post');
    const request = buildRequest({
      params: { id: 'db-presets-validation' },
      body: {
        name: 'Preset With Invalid Visibility',
        visibility: 'public',
      },
    });
    const response = buildResponse();

    createHandler(request, response);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: 'visibility',
            message: expect.stringContaining('Visibility must be one of'),
          }),
        ]),
      }),
    );
  });

  it('requires auth middleware to pass x-auth-token', () => {
    const requestWithoutToken = buildRequest({
      header: jest.fn().mockReturnValue(undefined),
    });
    const responseWithoutToken = buildResponse();
    const nextWithoutToken = jest.fn() as NextFunction;

    requireAuth(requestWithoutToken, responseWithoutToken, nextWithoutToken);

    expect(responseWithoutToken.statusCode).toBe(401);
    expect(responseWithoutToken.body).toEqual({
      error: 'Authentication required',
    });
    expect(nextWithoutToken).not.toHaveBeenCalled();

    const requestWithToken = buildRequest({
      header: jest.fn().mockReturnValue('token'),
    });
    const responseWithToken = buildResponse();
    const nextWithToken = jest.fn() as NextFunction;

    requireAuth(requestWithToken, responseWithToken, nextWithToken);

    expect(nextWithToken).toHaveBeenCalledTimes(1);
  });
});
