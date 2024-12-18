import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Remove empty columns options CSV Builder", () => {
  type Template = {
    a: string | undefined;
    b: string | null | undefined | number;
  };
  it("Should produce a CSV with empty columns kept", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [null, undefined]);
    expect(builder.getString()).toBe(
      loadCSVFixture(
        "builder-options/remove-empty-columns/unremoved-empty-columns"
      )
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with empty columns kept", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [null, undefined])
      .setBuilderOptions({
        removeEmptyColumns: true,
      });
    expect(builder.getString()).toBe(
      loadCSVFixture(
        "builder-options/remove-empty-columns/removed-empty-columns"
      )
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 1,
    });
  });

  it("Should produce a CSV with falsy columns kept", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["", ""])
      .createColumn("b", [0, 0])
      .setBuilderOptions({
        removeEmptyColumns: true,
      });
    expect(builder.getString()).toBe(
      loadCSVFixture("builder-options/remove-empty-columns/falsy-columns")
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
      .setBuilderOptions({
        removeEmptyColumns: true,
      });

    expect(builder.getString()).toBe("");
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 0,
      nCols: 0,
    });
  });
});
