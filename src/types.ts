export type CSVTemplate = Record<string, any>;

export type CSVData<T extends CSVTemplate> = Partial<{
  [K in keyof T]: Array<T[K]>;
}>;

export type CSVColumnOptions<T extends CSVTemplate> = Partial<{
  [K in keyof T]: ColumnOptions;
}>;

export type ColumnOptions = Partial<{
  priority: number;
  emptyValue: string | null;
  removeIfEmpty: boolean;
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
