import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { WidgetType } from '~/generated-metadata/graphql';

export const getDashboardFilterObjectMetadataItem = ({
  pageLayout,
  objectMetadataItems,
}: {
  pageLayout: PageLayout;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  const graphWidget = pageLayout.tabs
    .flatMap((tab) => tab.widgets)
    .find(
      (widget) =>
        widget.type === WidgetType.GRAPH && widget.objectMetadataId != null,
    );

  if (graphWidget?.objectMetadataId == null) {
    return null;
  }

  return (
    objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === graphWidget.objectMetadataId,
    ) ?? null
  );
};
