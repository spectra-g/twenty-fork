export type DashboardFilterVariable = {
  fieldMetadataId: string;
  operand: string;
  value?: string | number | boolean | null | Record<string, unknown>;
};
