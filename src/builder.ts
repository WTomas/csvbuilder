import {
  DEFAULT_EMPTY_VALUE,
  DEFAULT_EOL,
  DEFAULT_FIELD_WRAPPER,
  DEFAULT_SEPARATOR,
} from "./constants";
import { ICSVBuilder } from "./interfaces";
import {
  CSVBuilderOptions,
  CSVDimensions,
  ColumnOptions,
  CSVColumnOptions,
  CSVData,
  CSVTemplate,
} from "./types";

export class CSVBuilder<T extends CSVTemplate = Record<string, any>>
  implements ICSVBuilder<T>
{
  private data: CSVData<T> = {};
  private dataLength: number = 0;
  private options: CSVBuilderOptions = {
    separator: DEFAULT_SEPARATOR,
    eol: DEFAULT_EOL,
    fieldWrapper: DEFAULT_FIELD_WRAPPER,
    emptyValue: DEFAULT_EMPTY_VALUE,
    removeEmptyColumns: false,
  };
  private columnOptions: CSVColumnOptions<T> = {};

  private checkLength(column: any[]): void {
    if (this.dataLength === 0) {
      this.dataLength = column.length;
      return;
    }

    if (column.length !== this.dataLength) {
      throw new Error("Invalid column length!");
    }
  }

  public createColumn<K extends keyof T>(column: K, values: Array<T[K]>): this {
    this.checkLength(values);
    this.data[column] = values;
    return this;
  }

  public mapColumn<K1 extends keyof T, K2 extends keyof T>(
    fromColumn: K1,
    toColumn: K2,
    callbackFunc: (value: T[K1], index: number, values: Array<T[K1]>) => T[K2]
  ): this {
    if (!(fromColumn in this.data)) {
      throw new Error(`Column ${String(fromColumn)} has not been populated!`);
    }
    this.data[toColumn] = (this.data[fromColumn] as Array<T[K1]>).map(
      callbackFunc
    );
    return this;
  }

  public mapColumns<K extends keyof T>(
    toColumn: K,
    callbackFunc: (value: T, index: number, values: Array<T>) => T[K]
  ): this {
    this.data[toColumn] = [...Array(this.dataLength).keys()]
      .map((index) =>
        Object.keys(this.data).reduce((acc, key) => {
          return { ...acc, [key]: (this.data[key] as Array<T[string]>)[index] };
        }, <T>{})
      )
      .map(callbackFunc);
    return this;
  }

  public concat(builder: CSVBuilder<T>): this {
    this.data = Object.entries(builder.data).reduce((data, [key, values]) => {
      return {
        ...data,
        [key]: key in data ? [...(data[key] as []), ...(values as [])] : values,
      };
    }, this.data);
    this.columnOptions = Object.entries(builder.columnOptions).reduce(
      (aggrOptions, [key, options]) => {
        return {
          ...aggrOptions,
          [key]: key in aggrOptions ? aggrOptions[key] : options,
        };
      },
      this.columnOptions
    );
    this.options = Object.entries(builder.options).reduce(
      (aggrOptions, [key, value]) => {
        return {
          ...aggrOptions,
          [key]: aggrOptions[key] || value,
        };
      },
      this.options
    );

    this.dataLength = this.dataLength + builder.dataLength;
    return this;
  }

  public setColumnOptions<K extends keyof T>(
    column: K,
    options: ColumnOptions
  ): this {
    this.columnOptions[column] = options;
    return this;
  }

  public setBuilderOptions(options: Partial<CSVBuilderOptions>): this {
    this.options = Object.entries(options).reduce((options, [key, value]) => {
      return {
        ...options,
        [key]: value,
      };
    }, this.options);
    return this;
  }

  public sortColumns(): this {
    this.data = Object.keys(this.data)
      .sort((aCol, bCol) => {
        return (
          (this.columnOptions[aCol]?.priority ?? Number.MIN_SAFE_INTEGER) -
          (this.columnOptions[bCol]?.priority ?? Number.MIN_SAFE_INTEGER)
        );
      })
      .reduce((data, colName) => {
        return { ...data, [colName]: this.data[colName] };
      }, <CSVData<T>>{});
    return this;
  }

  public sortRows(callbackFn: (a: T, b: T) => number): this {
    this.data = [...Array(this.dataLength).keys()]
      .map((index) =>
        Object.keys(this.data).reduce((acc, column) => {
          return {
            ...acc,
            [column]: (this.data[column] as Array<T[string]>)[index],
          };
        }, <T>{})
      )
      .sort(callbackFn)
      .reduce(
        (acc, value) => {
          Object.entries(value).forEach(([key, value]) => {
            acc[key]?.push(value);
          });

          return acc;
        },
        <CSVData<T>>Object.keys(this.data).reduce((acc, key) => {
          return {
            ...acc,
            [key]: [],
          };
        }, {})
      );

    return this;
  }

  public getString(): string {
    let [headerString, columns] = this.getHeadersRows();
    return columns.length
      ? headerString +
          [...Array(this.dataLength).keys()]
            .map((index) =>
              columns.map((column) =>
                this.formatCell(this.data[column]?.[index], column)
              )
            )
            .map((fields) => fields.join(this.options.separator))
            .join(this.options.eol)
      : "";
  }

  public getDimensions(): CSVDimensions {
    const { maxHeaderLength, columns } = this.splitHeaders();
    return {
      nRows: columns.length ? this.dataLength + maxHeaderLength : 0,
      nCols: columns.length,
    };
  }

  public getStringAndDimensions(): [string, CSVDimensions] {
    return [this.getString(), this.getDimensions()];
  }

  public getDataAndOptions(): [
    CSVData<T>,
    CSVColumnOptions<T>,
    CSVBuilderOptions
  ] {
    return [this.data, this.columnOptions, this.options];
  }

  public static merge<T extends CSVTemplate>(
    ...builders: CSVBuilder<T>[]
  ): CSVBuilder<T> {
    if (builders.length === 0) {
      throw new Error("Please provide at least one builder to merge!");
    }
    if (builders.length === 1) return builders[0];
    const [firstBuilder, ...restOfBuilders] = builders;
    return restOfBuilders.reduce(
      (aggrBuilder, builder) => aggrBuilder.concat(builder),
      firstBuilder
    );
  }

  private formatCell<K extends keyof T>(value: any, column?: K): string {
    const columnOptions = column ? this.columnOptions[column] : undefined;
    const stringValue = String(
      value ?? columnOptions?.emptyValue ?? this.options.emptyValue
    ).replace(
      new RegExp(this.options.fieldWrapper, "g"),
      this.options.fieldWrapper + this.options.fieldWrapper
    );
    const specialValues = [
      this.options.fieldWrapper,
      this.options.eol,
      this.options.separator,
    ];
    if (
      specialValues.some((specialValue) => stringValue.includes(specialValue))
    ) {
      return (
        this.options.fieldWrapper + stringValue + this.options.fieldWrapper
      );
    } else {
      return stringValue;
    }
  }

  private getHeadersRows(): [string, Array<keyof T>] {
    const { maxHeaderLength, splitHeaders, columns } = this.splitHeaders();
    const headerString = maxHeaderLength
      ? [...Array(maxHeaderLength).keys()]
          .map((index) =>
            splitHeaders.map((splitHeader) =>
              this.formatCell(splitHeader[index] ?? "")
            )
          )
          .map((fields) => fields.join(this.options.separator))
          .join(this.options.eol) + this.options.eol
      : "";
    return [headerString, columns];
  }

  private splitHeaders(): {
    maxHeaderLength: number;
    splitHeaders: string[][];
    columns: Array<keyof T>;
  } {
    const columns = Object.keys(this.data).filter((key) =>
      this.options.removeEmptyColumns || this.columnOptions[key]?.removeIfEmpty
        ? this.data[key]?.some((v) => v !== null && v !== undefined)
        : true
    );
    const splitHeaders = columns.map((key) =>
      this.options.headerSeparator
        ? key.split(this.options.headerSeparator)
        : [key]
    );
    const maxHeaderLength = splitHeaders
      .map((splitColumn) => splitColumn.length)
      .reduce((acc, curr) => {
        return curr > acc ? curr : acc;
      }, 0);
    return {
      maxHeaderLength,
      splitHeaders,
      columns,
    };
  }
}
