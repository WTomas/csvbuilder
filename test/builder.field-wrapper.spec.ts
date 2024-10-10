import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Field wrapper options CSV Builder", () => {
  type Template = {
    a: string;
    b: string;
  };
  it("Should produce a CSV with an escaped field wrapper", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ['x"'])
      .createColumn("b", ["y"]);
    expect(builder.getString()).toBe(
      loadCSVFixture("field-wrapper/basic-escape")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
  it("Should produce a CSV with a custom field wrapper", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x\n"])
      .createColumn("b", ["y,"])
      .setBuilderOptions({
        fieldWrapper: "'",
      });
    expect(builder.getString()).toBe(loadCSVFixture("field-wrapper/custom"));
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
  it("Should produce a CSV with an escaped custom escaped EOL", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x'"])
      .createColumn("b", ["y"])
      .setBuilderOptions({
        fieldWrapper: "'",
      });
    expect(builder.getString()).toBe(
      loadCSVFixture("field-wrapper/custom-escape")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
});
