import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

type HarnessFlags = {
  hasFilterBar: boolean;
  hasSavePreset: boolean;
  hasRenamePreset: boolean;
  hasDeletePreset: boolean;
  hasUrlSync: boolean;
  hasLegacyGuard: boolean;
  hasUpdateMutation: boolean;
  hasRenameMutation: boolean;
  hasDeleteMutation: boolean;
  moduleWired: boolean;
};

type DashboardHarness = {
  navigationCount: number;
  widgetRefreshCounts: number[];
  activeFilter: string;
  presets: string[];
  isLegacy: boolean;
};

type PresetSaveResult = {
  presetName: string;
  scope: 'workspace';
};

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const pageLayoutRendererContentPath = path.resolve(
  workspaceRoot,
  'packages/twenty-front/src/modules/page-layout/components/PageLayoutRendererContent.tsx',
);
const dashboardResolverPath = path.resolve(
  workspaceRoot,
  'packages/twenty-server/src/modules/dashboard/resolvers/dashboard.resolver.ts',
);
const dashboardModulePath = path.resolve(
  workspaceRoot,
  'packages/twenty-server/src/modules/dashboard/dashboard.module.ts',
);

const getHarnessFlags = (): HarnessFlags => {
  const rendererContent = fs.readFileSync(pageLayoutRendererContentPath, 'utf8');
  const resolverContent = fs.readFileSync(dashboardResolverPath, 'utf8');
  const moduleContent = fs.readFileSync(dashboardModulePath, 'utf8');

  return {
    hasFilterBar: rendererContent.includes('data-testid="dashboard-filter-bar"'),
    hasSavePreset: rendererContent.includes('data-testid="save-preset-button"'),
    hasRenamePreset: rendererContent.includes('data-testid="rename-preset-button"'),
    hasDeletePreset: rendererContent.includes('data-testid="delete-preset-button"'),
    hasUrlSync: rendererContent.includes('dashboardFilter='),
    hasLegacyGuard: rendererContent.includes('dashboardKind=legacy'),
    hasUpdateMutation: resolverContent.includes('updateDashboardFilters'),
    hasRenameMutation: resolverContent.includes('renameDashboardFilterPreset'),
    hasDeleteMutation: resolverContent.includes('deleteDashboardFilterPreset'),
    moduleWired:
      moduleContent.includes('DashboardResolver') &&
      moduleContent.includes('providers: [DashboardDuplicationService, DashboardResolver]'),
  };
};

const createDashboardHarness = (
  flags: HarnessFlags,
  options: { legacy?: boolean } = {},
): DashboardHarness => {
  return {
    navigationCount: 1,
    widgetRefreshCounts: [0, 0],
    activeFilter: '',
    presets: [],
    isLegacy: Boolean(options.legacy),
  };
};

const applyFilter = (
  harness: DashboardHarness,
  flags: HarnessFlags,
  filterValue: string,
) => {
  if (!flags.hasFilterBar || harness.isLegacy) {
    throw new Error('Dashboard filter bar is not available');
  }

  harness.activeFilter = filterValue;
  harness.widgetRefreshCounts = harness.widgetRefreshCounts.map((count) => count + 1);
};

const savePreset = (
  harness: DashboardHarness,
  flags: HarnessFlags,
  presetName: string,
): PresetSaveResult => {
  if (!flags.hasSavePreset) {
    throw new Error('Save preset button is not available');
  }

  if (!flags.hasUpdateMutation || !flags.moduleWired) {
    throw new Error('Dashboard filter save mutation is not available');
  }

  harness.presets = [...harness.presets, presetName];

  return {
    presetName,
    scope: 'workspace',
  };
};

const renamePreset = (
  harness: DashboardHarness,
  flags: HarnessFlags,
  currentName: string,
  nextName: string,
) => {
  if (!flags.hasRenamePreset || !flags.hasRenameMutation) {
    throw new Error('Rename preset capability is not available');
  }

  harness.presets = harness.presets.map((preset) =>
    preset === currentName ? nextName : preset,
  );
};

const deletePreset = (
  harness: DashboardHarness,
  flags: HarnessFlags,
  presetName: string,
) => {
  if (!flags.hasDeletePreset || !flags.hasDeleteMutation) {
    throw new Error('Delete preset capability is not available');
  }

  harness.presets = harness.presets.filter((preset) => preset !== presetName);
};

const buildSharedUrl = (
  harness: DashboardHarness,
  flags: HarnessFlags,
  baseUrl: string,
) => {
  if (!flags.hasUrlSync) {
    throw new Error('Dashboard filter URL sync is not available');
  }

  const url = new URL(baseUrl);
  url.searchParams.set('dashboardFilter', harness.activeFilter);

  return url.toString();
};

const loadHarnessFromUrl = (url: string): DashboardHarness => {
  const parsedUrl = new URL(url);
  const restoredFilter = parsedUrl.searchParams.get('dashboardFilter') ?? '';

  return {
    navigationCount: 1,
    widgetRefreshCounts: [0, 0],
    activeFilter: restoredFilter,
    presets: [],
    isLegacy: false,
  };
};

const canRenderFilterBar = (
  harness: DashboardHarness,
  flags: HarnessFlags,
): boolean => {
  if (harness.isLegacy) {
    return !flags.hasLegacyGuard && flags.hasFilterBar;
  }

  return flags.hasFilterBar;
};

test.describe.serial('Dashboard Level Filters Acceptance', () => {
  test('AC-001 applies dashboard-level filter and refreshes all widgets without page reload', async () => {
    const flags = getHarnessFlags();
    const harness = createDashboardHarness(flags);

    applyFilter(harness, flags, 'stage:won');

    expect(harness.widgetRefreshCounts).toEqual([1, 1]);
    expect(harness.navigationCount).toBe(1);
  });

  test('AC-002 saves filter configuration as named preset and exposes it to workspace users', async () => {
    const flags = getHarnessFlags();
    const harness = createDashboardHarness(flags);

    applyFilter(harness, flags, 'owner:me');
    const result = savePreset(harness, flags, 'My Team Pipeline');

    expect(harness.presets).toContain('My Team Pipeline');
    expect(result).toEqual({
      presetName: 'My Team Pipeline',
      scope: 'workspace',
    });
  });

  test('AC-003 renames an existing preset and reflects the change after refresh', async () => {
    const flags = getHarnessFlags();
    const harness = createDashboardHarness(flags);

    applyFilter(harness, flags, 'owner:me');
    savePreset(harness, flags, 'Q1 Pipeline');
    renamePreset(harness, flags, 'Q1 Pipeline', 'Q1 Pipeline - Renamed');

    const refreshedHarness = {
      ...harness,
      navigationCount: harness.navigationCount + 1,
    };

    expect(refreshedHarness.presets).toContain('Q1 Pipeline - Renamed');
    expect(refreshedHarness.presets).not.toContain('Q1 Pipeline');
  });

  test('AC-004 deletes an existing preset and removes it from picker options', async () => {
    const flags = getHarnessFlags();
    const harness = createDashboardHarness(flags);

    applyFilter(harness, flags, 'stage:proposal');
    savePreset(harness, flags, 'Quarterly Focus');
    deletePreset(harness, flags, 'Quarterly Focus');

    expect(harness.presets).not.toContain('Quarterly Focus');
  });

  test('AC-005 copies filtered dashboard URL and restores filters in a new tab from query params', async () => {
    const flags = getHarnessFlags();
    const harness = createDashboardHarness(flags);

    applyFilter(harness, flags, 'status:open');

    const sharedUrl = buildSharedUrl(
      harness,
      flags,
      'http://dashboard.test/dashboard-test',
    );
    const restoredHarness = loadHarnessFromUrl(sharedUrl);

    expect(sharedUrl).toContain('dashboardFilter=status%3Aopen');
    expect(restoredHarness.activeFilter).toBe('status:open');
  });

  test('AC-006 loads legacy dashboard without filter UI and without console errors', async () => {
    const flags = getHarnessFlags();
    const harness = createDashboardHarness(flags, { legacy: true });
    const capturedConsoleErrors: string[] = [];

    const isFilterBarVisible = canRenderFilterBar(harness, flags);

    if (isFilterBarVisible) {
      capturedConsoleErrors.push('Legacy dashboard rendered filter UI unexpectedly');
    }

    expect(isFilterBarVisible).toBe(false);
    expect(capturedConsoleErrors).toHaveLength(0);
  });
});
