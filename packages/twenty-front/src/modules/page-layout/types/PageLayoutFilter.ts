export type PageLayoutFilterOption = {
  label: string;
  value: string;
};

export type PageLayoutFilter = {
  field: string;
  label: string;
  options: PageLayoutFilterOption[];
};

export type PageLayoutActiveFilter = {
  field: string;
  label: string;
  value: string;
};
