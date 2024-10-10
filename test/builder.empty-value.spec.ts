import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Empty value options CSV Builder", () => {
  type Template = {
    a: string | undefined;
    b: string | null | number;
  };
  it("Should produce a CSV with the default empty value", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [null, "y"]);
    expect(builder.getString()).toBe(
      loadCSVFixture("empty-value/default-empty-value")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom empty value", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [null, "y"])
      .setBuilderOptions({
        emptyValue: "N/A",
      });
    expect(builder.getString()).toBe(
      loadCSVFixture("empty-value/custom-empty-value")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom empty value with an escaped separator", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [null, "y"])
      .setBuilderOptions({
        emptyValue: "EMPTY,VALUE",
      });
    expect(builder.getString()).toBe(
      loadCSVFixture("empty-value/custom-empty-value-with-separator")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom empty value with an escaped eol", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x", undefined])
      .createColumn("b", [null, "y"])
      .setBuilderOptions({
        emptyValue: "EMPTY\nVALUE",
      });
    expect(builder.getString()).toBe(
      loadCSVFixture("empty-value/custom-empty-value-with-eol")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with a custom empty value with an escaped field wrapper", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["", undefined])
      .createColumn("b", [null, 0]);
    expect(builder.getString()).toBe(
      loadCSVFixture("empty-value/default-empty-value-falsy-values")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });
});
