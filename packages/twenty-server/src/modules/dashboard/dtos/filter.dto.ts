export type FilterPrimitiveValue = string | number | boolean | null;

export type FilterValueDTO =
  | FilterPrimitiveValue
  | FilterObjectDTO
  | FilterValueDTO[];

export type FilterObjectDTO = Record<string, FilterValueDTO>;
