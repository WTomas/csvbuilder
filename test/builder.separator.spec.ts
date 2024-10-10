import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Separator options CSV Builder", () => {
  type Template = {
    a: string;
    b: string;
  };
  it("Should produce a CSV with an escaped separator", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x,"])
      .createColumn("b", ["y;"]);
    expect(builder.getString()).toBe(loadCSVFixture("separator/basic-escape"));
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
  it("Should produce a CSV with a custom separator", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x"])
      .createColumn("b", ["y"])
      .setBuilderOptions({
        separator: ";",
      });
    expect(builder.getString()).toBe(loadCSVFixture("separator/custom"));
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
  it("Should produce a CSV with a custom separator with correct escaping", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a", ["x;"])
      .createColumn("b", ["y"])
      .setBuilderOptions({
        separator: ";",
      });
    expect(builder.getString()).toBe(loadCSVFixture("separator/custom-escape"));
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
});
