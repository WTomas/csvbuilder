import {
  CSVBuilder,
  CSVBuilderOptions,
  DEFAULT_EMPTY_VALUE,
  DEFAULT_EOL,
  DEFAULT_FIELD_WRAPPER,
  DEFAULT_SEPARATOR,
} from "../src";

describe("Setting builder options", () => {
  type Template = {
    id: number;
  };

  const defaultBuilderOptions: CSVBuilderOptions = {
    emptyValue: DEFAULT_EMPTY_VALUE,
    eol: DEFAULT_EOL,
    fieldWrapper: DEFAULT_FIELD_WRAPPER,
    separator: DEFAULT_SEPARATOR,
    removeEmptyColumns: false,
  };

  it("Should correctly merge the column options when setting them at different points", () => {
    const builder = new CSVBuilder<Template>().setBuilderOptions({
      emptyValue: "",
    });

    expect(builder.getDataAndOptions()[2]).toMatchObject({
      ...defaultBuilderOptions,
      emptyValue: "",
    });

    builder.setBuilderOptions({
      removeEmptyColumns: true,
    });

    expect(builder.getDataAndOptions()[2]).toMatchObject({
      ...defaultBuilderOptions,
      emptyValue: "",
      removeEmptyColumns: true,
    });

    builder.setBuilderOptions({
      emptyValue: null,
    });

    expect(builder.getDataAndOptions()[2]).toMatchObject({
      ...defaultBuilderOptions,
      removeEmptyColumns: true,
    });
  });
});
