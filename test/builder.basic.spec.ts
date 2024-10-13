import {
  CSVBuilder,
  CSVBuilderOptions,
  CSVColumnOptions,
  CSVData,
  CSVDimensions,
  DEFAULT_EMPTY_VALUE,
  DEFAULT_EOL,
  DEFAULT_FIELD_WRAPPER,
  DEFAULT_SEPARATOR,
  ICSVBuilder,
} from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Basic CSV Builder", () => {
  describe("Empty builder", () => {
    it("Empty builder should produce empty string", () => {
      expect(new CSVBuilder().getString()).toBe("");
    });

    it("Empty builder should produce correct dimensions", () => {
      expect(new CSVBuilder().getDimensions()).toMatchObject(<CSVDimensions>{
        nRows: 0,
        nCols: 0,
      });
    });

    it("Empty builder should produce empty string and correct dimensions", () => {
      const [s, dimensions] = new CSVBuilder().getStringAndDimensions();
      expect(s).toBe("");
      expect(dimensions).toMatchObject(<CSVDimensions>{
        nRows: 0,
        nCols: 0,
      });
    });
  });

  type Template = {
    Country: string;
    Capital: string;
    Population: number;
    "Country and Capital": string;
    CapitalRiver: string | undefined;
  };

  const countries = ["Hungary", "Poland", "Spain"];
  const capitals: Record<string, string> = {
    Hungary: "Budapest",
    Poland: "Warsaw",
    Spain: "Madrid",
  };
  const populations: Record<string, number> = {
    Hungary: 9643000,
    Poland: 36820000,
    Spain: 47780000,
  };
  const rivers: Record<string, string> = {
    Budapest: "Danube",
    Warsaw: "Vistula",
  };
  let builder: ICSVBuilder<Template>;
  let expectedCsv: string;
  const populationTransformFunction = (value: number): string =>
    value.toLocaleString();

  beforeAll(() => {
    builder = new CSVBuilder<Template>()
      .createColumn("Country", countries)
      .setColumnOptions("Country", { priority: 1 })
      .mapColumn("Country", "Capital", (country) => capitals[country])
      .setColumnOptions("Capital", { priority: 2 })
      .mapColumns(
        "Country and Capital",
        ({ Country: country, Capital: capital }) => `${country} - ${capital}`
      )
      .setColumnOptions("Country and Capital", { priority: 3 })
      .mapColumn("Country", "Population", (country) => populations[country])
      .setColumnOptions("Population", {
        transform: populationTransformFunction,
      })
      .mapColumn("Capital", "CapitalRiver", (capital) => rivers[capital])
      .setColumnOptions("CapitalRiver", { priority: 4, emptyValue: "N/A" })
      .sortColumns()
      .sortRows(
        ({ Population: populationA }, { Population: populationB }) =>
          populationB - populationA
      );
    expectedCsv = loadCSVFixture("basic/countries");
  });

  it("Should produce a basic CSV", () => {
    expect(builder.getString()).toBe(expectedCsv);
  });
  it("Should produce the correct dimensions", () => {
    expect(builder.getDimensions()).toMatchObject(<CSVDimensions>{
      nRows: 4,
      nCols: 5,
    });
  });
  it("Should produce a basic CSV with the correct dimensions", () => {
    const [csvString, dimensions] = builder.getStringAndDimensions();
    expect(csvString).toBe(expectedCsv);
    expect(dimensions).toMatchObject(<CSVDimensions>{
      nRows: 4,
      nCols: 5,
    });
  });
  it("Should have the correct internal data", () => {
    const [data, columnOptions, builderOptions] = builder.getDataAndOptions();
    expect(data).toMatchObject(<Partial<CSVData<Template>>>{
      Country: ["Spain", "Poland", "Hungary"],
      Capital: ["Madrid", "Warsaw", "Budapest"],
      "Country and Capital": [
        "Spain - Madrid",
        "Poland - Warsaw",
        "Hungary - Budapest",
      ],
      CapitalRiver: [undefined, "Vistula", "Danube"],
      Population: [47780000, 36820000, 9643000],
    });
    expect(columnOptions).toMatchObject(<Partial<CSVColumnOptions<Template>>>{
      Country: { priority: 1 },
      Capital: { priority: 2 },
      "Country and Capital": { priority: 3 },
      CapitalRiver: { priority: 4, emptyValue: "N/A" },
      Population: { transform: populationTransformFunction },
    });
    expect(builderOptions).toMatchObject(<CSVBuilderOptions>{
      emptyValue: DEFAULT_EMPTY_VALUE,
      eol: DEFAULT_EOL,
      separator: DEFAULT_SEPARATOR,
      fieldWrapper: DEFAULT_FIELD_WRAPPER,
      removeEmptyColumns: false,
    });
  });
});
