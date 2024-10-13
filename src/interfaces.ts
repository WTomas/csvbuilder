import { CSVBuilder } from "./builder";
import {
  CSVBuilderOptions,
  CSVDimensions,
  ColumnOptions,
  CSVTemplate,
  CSVData,
  CSVColumnOptions,
} from "./types";

export interface ICSVBuilder<T extends CSVTemplate> {
  createColumn<K extends keyof T>(column: K, values: Array<T[K]>): this;
  mapColumn<K1 extends keyof T, K2 extends keyof T>(
    fromColumn: K1,
    toColumn: K2,
    callbackFunc: (value: T[K1], index: number, values: Array<T[K1]>) => T[K2]
  ): this;
  mapColumns<K extends keyof T>(
    toColumn: K,
    callbackFunc: (value: T, index: number, values: Array<T>) => T[K]
  ): this;
  concat(other: CSVBuilder<T>): this;
  setColumnOptions<K extends keyof T>(
    column: K,
    options: ColumnOptions<T, K>
  ): this;
  setBuilderOptions(options: Partial<CSVBuilderOptions>): this;
  sortColumns(): this;
  sortRows(callbackFn: (a: T, b: T) => number): this;
  getString(): string;
  getDimensions(): CSVDimensions;
  getStringAndDimensions(): [string, CSVDimensions];
  getDataAndOptions(): [CSVData<T>, CSVColumnOptions<T>, CSVBuilderOptions];
}
