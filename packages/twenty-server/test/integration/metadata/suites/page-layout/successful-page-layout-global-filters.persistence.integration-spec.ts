import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

describe('Page layout global filters persistence', () => {
  let pageLayoutId: string;

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Page Layout With Global Filters' },
    });

    pageLayoutId = data.createPageLayout.id;
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('should persist and reload globalFilters JSON through the repository', async () => {
    const pageLayoutRepository =
      global.testDataSource.getRepository(PageLayoutEntity);

    const globalFilters = {
      owner: 'user-123',
      dateRange: {
        from: '2024-01-01',
        to: '2024-12-31',
      },
    };

    const existingPageLayout = await pageLayoutRepository.findOneOrFail({
      where: { id: pageLayoutId },
    });

    await pageLayoutRepository.save({
      ...existingPageLayout,
      globalFilters,
    });

    const reloadedPageLayout = await pageLayoutRepository.findOneOrFail({
      where: { id: pageLayoutId },
    });

    expect(reloadedPageLayout.globalFilters).toEqual(globalFilters);
  });
});
