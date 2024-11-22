import { CSVBuilder } from "../src";

describe("Setting column options", () => {
  type Template = {
    id: number;
  };

  it("Should correctly merge the column options when setting them at different points", () => {
    const builder = new CSVBuilder<Template>().setColumnOptions("id", {
      removeIfEmpty: true,
    });

    expect(builder.getDataAndOptions()[1]["id"]).toMatchObject({
      removeIfEmpty: true,
    });

    builder.setColumnOptions("id", {
      priority: 1,
    });

    expect(builder.getDataAndOptions()[1]["id"]).toMatchObject({
      removeIfEmpty: true,
      priority: 1,
    });

    builder.setColumnOptions("id", {
      removeIfEmpty: false,
    });

    expect(builder.getDataAndOptions()[1]["id"]).toMatchObject({
      removeIfEmpty: false,
      priority: 1,
    });
  });
});
