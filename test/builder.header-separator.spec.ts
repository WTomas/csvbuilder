import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Header separator options CSV Builder", () => {
  type Template = {
    "a.subHeader": string;
    "b.subHeader": string;
  };
  type Template2 = {
    "a.subHeader": string;
    b: string;
  };
  it("Should produce a CSV with unseparated headers", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a.subHeader", ["x"])
      .createColumn("b.subHeader", ["y"]);
    expect(builder.getString()).toBe(
      loadCSVFixture("header-separator/unseparated")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 2,
      nCols: 2,
    });
  });
  it("Should produce a CSV with separated headers", () => {
    const builder = new CSVBuilder<Template>()
      .createColumn("a.subHeader", ["x"])
      .createColumn("b.subHeader", ["y"])
      .setBuilderOptions({
        headerSeparator: ".",
      });
    expect(builder.getString()).toBe(
      loadCSVFixture("header-separator/separated")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });

  it("Should produce a CSV with separated headers and pad where insufficient number of subHeaders are given", () => {
    const builder = new CSVBuilder<Template2>()
      .createColumn("a.subHeader", ["x"])
      .createColumn("b", ["y"])
      .setBuilderOptions({
        headerSeparator: ".",
      });
    expect(builder.getString()).toBe(
      loadCSVFixture("header-separator/padded-separated")
    );
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 3,
      nCols: 2,
    });
  });
});
