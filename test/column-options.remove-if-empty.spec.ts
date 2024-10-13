import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Remove if empty column options CSV Builder", () => {
  type Template = {
    a: string | undefined;
    b: string | null | number;
  };
  it("Should produce a CSV with a custom empty value for the column", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [null, null])
      .setColumnOptions("b", { removeIfEmpty: true });

    expect(builder.getString()).toBe(
      loadCSVFixture("column-options/remove-if-empty/basic-remove-if-empty")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 1,
    });
  });

  it("Should produce a CSV with the column kept", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", ["y", null])
      .setColumnOptions("b", { removeIfEmpty: true });

    expect(builder.getString()).toBe(
      loadCSVFixture("column-options/remove-if-empty/basic-unremove-if-empty")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom empty value for the column", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [0, 0])
      .setColumnOptions("b", { removeIfEmpty: true });

    expect(builder.getString()).toBe(
      loadCSVFixture("column-options/remove-if-empty/falsy-column")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce an empty CSV if all columns were empty", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", [undefined, undefined])
      .createColumn("b", [null, null])
      .setColumnOptions("a", { removeIfEmpty: true })
      .setColumnOptions("b", { removeIfEmpty: true });

    expect(builder.getString()).toBe("");
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 0,
      nCols: 0,
    });
  });
});
