import express from 'express';

type PresetVisibility = 'private' | 'workspace';

interface DashboardPreset {
  id: string;
  dashboardId: string;
  name: string;
  visibility: PresetVisibility;
  filters: unknown[];
}

interface DashboardPresetStore {
  activePresetId: string | null;
  presets: DashboardPreset[];
}

const VALID_VISIBILITIES: PresetVisibility[] = ['private', 'workspace'];
const presetStoreByDashboard = new Map<string, DashboardPresetStore>();

const getStoreForDashboard = (dashboardId: string): DashboardPresetStore => {
  const existingStore = presetStoreByDashboard.get(dashboardId);

  if (existingStore) {
    return existingStore;
  }

  const nextStore: DashboardPresetStore = {
    activePresetId: null,
    presets: [],
  };

  presetStoreByDashboard.set(dashboardId, nextStore);

  return nextStore;
};

const validateVisibility = (value: unknown): value is PresetVisibility =>
  typeof value === 'string' &&
  VALID_VISIBILITIES.includes(value as PresetVisibility);

const buildPresetId = () => `preset-${Math.random().toString(36).slice(2, 10)}`;

export const dashboardPresetsRouter = express.Router();

dashboardPresetsRouter.post('/:id/presets', (request, response) => {
  const dashboardId = request.params.id;
  const store = getStoreForDashboard(dashboardId);
  const { name, filters = [], visibility } = request.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    response.status(400).json({
      errors: [{ path: 'name', message: 'Preset name is required' }],
    });

    return;
  }

  if (!validateVisibility(visibility)) {
    response.status(400).json({
      errors: [
        {
          path: 'visibility',
          message: `Visibility must be one of: ${VALID_VISIBILITIES.join(', ')}`,
        },
      ],
    });

    return;
  }

  if (!Array.isArray(filters)) {
    response.status(400).json({
      errors: [{ path: 'filters', message: 'filters must be an array' }],
    });

    return;
  }

  const preset: DashboardPreset = {
    id: buildPresetId(),
    dashboardId,
    name: name.trim(),
    visibility,
    filters,
  };

  store.presets.push(preset);

  if (!store.activePresetId) {
    store.activePresetId = preset.id;
  }

  response.status(201).json({
    preset,
  });
});

dashboardPresetsRouter.get('/:id/presets', (request, response) => {
  const store = getStoreForDashboard(request.params.id);

  response.status(200).json({
    activePresetId: store.activePresetId,
    presets: store.presets,
  });
});

dashboardPresetsRouter.put('/:id/presets/:presetId', (request, response) => {
  const { id: dashboardId, presetId } = request.params;
  const { name } = request.body ?? {};
  const store = getStoreForDashboard(dashboardId);
  const preset = store.presets.find((item) => item.id === presetId);

  if (!preset) {
    response.status(404).json({ error: 'Preset not found' });

    return;
  }

  if (typeof name !== 'string' || !name.trim()) {
    response.status(400).json({
      errors: [{ path: 'name', message: 'Preset name is required' }],
    });

    return;
  }

  preset.name = name.trim();

  response.status(200).json({
    preset,
  });
});

dashboardPresetsRouter.delete('/:id/presets/:presetId', (request, response) => {
  const { id: dashboardId, presetId } = request.params;
  const store = getStoreForDashboard(dashboardId);
  const presetIndex = store.presets.findIndex((item) => item.id === presetId);

  if (presetIndex < 0) {
    response.status(404).json({ error: 'Preset not found' });

    return;
  }

  const [deletedPreset] = store.presets.splice(presetIndex, 1);

  if (store.activePresetId === deletedPreset.id) {
    store.activePresetId = store.presets[0]?.id ?? null;
  }

  response.status(200).json({
    deletedPresetId: deletedPreset.id,
  });
});

dashboardPresetsRouter.post(
  '/:id/presets/:presetId/select',
  (request, response) => {
    const { id: dashboardId, presetId } = request.params;
    const store = getStoreForDashboard(dashboardId);
    const presetExists = store.presets.some((item) => item.id === presetId);

    if (!presetExists) {
      response.status(404).json({ error: 'Preset not found' });

      return;
    }

    store.activePresetId = presetId;

    response.status(200).json({
      activePresetId: presetId,
    });
  },
);
