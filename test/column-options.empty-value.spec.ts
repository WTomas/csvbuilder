import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Empty value column options CSV Builder", () => {
  type Template = {
    a: string | undefined;
    b: string | null | number;
  };
  it("Should produce a CSV with a custom empty value for the column", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .setColumnOptions("a", { emptyValue: "N/A" })
      .createColumn("b", [null, "y"]);
    expect(builder.getString()).toBe(
      loadCSVFixture("column-options/empty-value/basic-empty-value")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom empty value for the column", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .setColumnOptions("a", { emptyValue: "N/A" })
      .createColumn("b", [null, "y"])
      .setBuilderOptions({ emptyValue: "EMPTY" });
    expect(builder.getString()).toBe(
      loadCSVFixture("column-options/empty-value/with-global-empty-value")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom escaped empty value with a separator for the column", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .setColumnOptions("a", { emptyValue: "EMPTY,VALUE" })
      .createColumn("b", [null, "y"]);
    expect(builder.getString()).toBe(
      loadCSVFixture("column-options/empty-value/empty-value-with-separator")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom escaped empty value with an eol for the column", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .setColumnOptions("a", { emptyValue: "EMPTY\nVALUE" })
      .createColumn("b", [null, "y"]);
    expect(builder.getString()).toBe(
      loadCSVFixture("column-options/empty-value/empty-value-with-eol")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom escaped empty value with a field-wrapper for the column", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .setColumnOptions("a", { emptyValue: '"N/A"' })
      .createColumn("b", [null, "y"]);
    expect(builder.getString()).toBe(
      loadCSVFixture(
        "column-options/empty-value/empty-value-with-field-wrapper"
      )
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });
});
