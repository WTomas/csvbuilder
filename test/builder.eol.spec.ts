import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("EOL options CSV Builder", () => {
  type Template = {
    a: string;
    b: string;
  };
  it("Should produce a CSV with an escaped EOL", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x\n"])
      .createColumn("b", ["y"]);
    expect(builder.getString()).toBe(loadCSVFixture("eol/basic-escape"));
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
  it("Should produce a CSV with a custom EOL", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x"])
      .createColumn("b", ["y"])
      .setBuilderOptions({
        eol: "\t",
      });
    expect(builder.getString()).toBe(loadCSVFixture("eol/custom"));
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
  it("Should produce a CSV with a custom escaped EOL", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x\t"])
      .createColumn("b", ["y"])
      .setBuilderOptions({
        eol: "\t",
      });
    expect(builder.getString()).toBe(loadCSVFixture("eol/custom-escape"));
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
});
