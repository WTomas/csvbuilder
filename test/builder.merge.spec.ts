import { CSVBuilder, CSVDimensions, ICSVBuilder } from "../src";
import { loadCSVFixture } from "./utils/load-csv-fixture";

describe("Builder merge", () => {
  type Template = {
    Country: string;
    Capital: string;
    Population: number;
    "Country and Capital": string;
    CapitalRiver: string | undefined;
  };

  const countries = ["Hungary", "Poland"];
  const otherCountries = ["Spain"];
  const capitals: Record<string, string> = {
    Hungary: "Budapest",
    Poland: "Warsaw",
    Spain: "Madrid",
  };
  const populations: Record<string, number> = {
    Hungary: 9643000,
    Poland: 36820000,
    Spain: 477800000,
  };
  const rivers: Record<string, string> = {
    Budapest: "Danube",
    Warsaw: "Vistula",
  };
  let builder1: CSVBuilder<Template>;
  let builder2: CSVBuilder<Template>;
  let builder: CSVBuilder<Template>;
  let expectedCsv: string;
  beforeAll(() => {
    builder1 = new CSVBuilder<Template>()
      .createColumn("Country", countries)
      .mapColumn("Country", "Capital", (country) => capitals[country])
      .mapColumns(
        "Country and Capital",
        ({ Country: country, Capital: capital }) => `${country} - ${capital}`
      )
      .mapColumn("Country", "Population", (country) => populations[country])
      .mapColumn("Capital", "CapitalRiver", (capital) => rivers[capital]);

    builder2 = new CSVBuilder<Template>()
      .createColumn("Country", otherCountries)
      .mapColumn("Country", "Capital", (country) => capitals[country])
      .mapColumns(
        "Country and Capital",
        ({ Country: country, Capital: capital }) => `${country} - ${capital}`
      )
      .mapColumn("Country", "Population", (country) => populations[country])
      .mapColumn("Capital", "CapitalRiver", (capital) => rivers[capital]);

    builder = CSVBuilder.merge(builder1, builder2);
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
});
