import gql from 'graphql-tag';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Page layout dashboard filters', () => {
  let pageLayoutId: string;
  let pageLayoutTabId: string;

  beforeEach(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard Layout',
        type: PageLayoutType.DASHBOARD,
      },
    });

    pageLayoutId = data.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Overview',
        pageLayoutId,
      },
    });

    pageLayoutTabId = tabData.createPageLayoutTab.id;
  });

  afterEach(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: pageLayoutTabId },
    });

    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('should accept dashboardFilters in updatePageLayoutWithTabsAndWidgets input', async () => {
    const response = await makeMetadataAPIRequest({
      query: gql`
        mutation UpdatePageLayoutWithTabsAndWidgets(
          $id: String!
          $input: UpdatePageLayoutWithTabsInput!
        ) {
          updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
            id
            name
          }
        }
      `,
      variables: {
        id: pageLayoutId,
        input: {
          name: 'Dashboard Layout',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          dashboardFilters: [
            {
              fieldMetadataId: 'stage',
              operand: 'EQ',
              value: 'OPEN',
            },
          ],
          tabs: [
            {
              id: pageLayoutTabId,
              title: 'Overview',
              position: 0,
              widgets: [],
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.updatePageLayoutWithTabsAndWidgets.id).toBe(
      pageLayoutId,
    );
  });
});
