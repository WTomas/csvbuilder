import * as fs from "fs";
export function loadCSVFixture(name: string): string {
  return fs
    .readFileSync(`./test/fixtures/${name.replace(/.csv$/, "")}.csv`)
    .toString();
}
