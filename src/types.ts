export type CSVTemplate = Record<string, any>;

export type CSVData<T extends CSVTemplate> = Partial<{
  [K in keyof T]: Array<T[K]>;
}>;

export type CSVColumnOptions<T extends CSVTemplate> = Partial<{
  [K in keyof T]: ColumnOptions<T, K>;
}>;

export type CSVColumnTransform<T extends CSVTemplate, K extends keyof T> = (
  value: T[K],
  index,
  values: Array<T[K]>
) => string | undefined | null;

export type ColumnOptions<T extends CSVTemplate, K extends keyof T> = Partial<{
  priority: number;
  emptyValue: string | null;
  removeIfEmpty: boolean;
  transform?: CSVColumnTransform<T, K>;
}>;

export type CSVBuilderOptions = {
  separator: string;
  eol: string;
  fieldWrapper: string;
  headerSeparator?: string;
  emptyValue: string | null;
  removeEmptyColumns?: boolean;
};

export type CSVDimensions = {
  nRows: number;
  nCols: number;
};
