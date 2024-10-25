# CSVBuilder

CSVBuilder is a generic utility that aims to simplify the creation of CSV files in your code, providing a simple and intuitive interface to build files step-by-step in a type-safe way.

## Getting started
First, if you know the layout of your CSV file, you can define a type `CSVTemplate extends Record<string, any>`, which can then be provided as a type-variable of your builder. For example, if you want to build a csv-file with the following columns: 

|Country|Capital|Country and Capital|Capital River|Population|
| --- | --- | --- | --- | --- | 
|Spain|Madrid|Spain - Madrid|N/A|47,780,000|
|Poland|Warsaw|Poland - Warsaw|Vistula|36,820,000|
|Hungary|Budapest|Hungary - Budapest|Danube|9,643,000|


You can represent this as the following template, and provide it to the `CSVBuilder`

```typescript
import { CSVBuilder } from 'ts-csv-builder'

type CSVTemplate = {
    Country: string;
    Capital: string;
    Population: number;
    "Country and Capital": string;
    "Capital River": string | undefined;
  };

const builder = new CSVBuilder<CSVTemplate>()
```

This will provide you with the proper typing when you start building your file. 

## Builder options
You can set the following options on the builder:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
|`separator`|`string`| `,`    | String value used to separate field values in the resulting CSV string. |
|`eol`|`string`|`\n`| String value used to separate the rows in the resulting CSV string. |
|`fieldWrapper`|`string`|`"`| String value used for wrapping field values in case special characters occur. |
| `headerSeparator` | `string` \| `undefined` | `undefined` | If not undefined, column names will be split on the provided string and subheaders will be created in the resulting CSV string. |
| `emptyValue` | `string` \| `null` | `null` | Value to replace empty (`null` \| `undefined`) column values with across the resulting CSV string. |
| `removeEmptyColumns` | `boolean` | `false` | If `true` then empty columns (with only `null` \| `undefined` values) will be dropped before converting to a CSV string. |

These can be set via the following:
```typescript
builder.setBuilderOptions({emptyValue: "N/A"})
```
Only the properties that you explicitly set will be updated from their default values.

### Subheaders
In some CSV files, you may want to create a headers which span across multiple rows. The header separator option let's you achieve this easily. For example, if you want to create a CSV with the following layout:

|Header 1|Header 1|Header 2|
|---|---|---|
|Subheader 1|Subheader 2||
|...|...|...|

You can create a template such as this in your code:
```typescript
type Template = {
    `Header 1.Subheader 1`: any, 
    `Header 1.Subheader 2`: any, 
    `Header 2`: any, 
  }
```
and set the builder options to with the appropiate header separator:
```typescript
const builder = new CSVBuilder<Template>().setBuilderOptions({
    headerSeparator: '.'
  })
```
This will then correctly, split the headers and, in case the number of split values are not equal across all columns names, pad the rows with empty string for missing subheaders.

## Creating columns
You can add a column's data to the builder with the `.createColumn` method.

```typescript
const countries = ["Hungary", "Poland", "Spain"];

builder.createColumn('Country', countries)

```

> :warning: Subsequent `.createColumn` calls must provide an array with the **same length** as the initial one, otherwise the builder will raise an error.

### Mapping a column
To map the values of an existing column to create another one, you can use `.mapColumn`:

```typescript
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

builder
  .mapColumn("Country", "Capital", (country) => capitals[country])
  .mapColumn("Country", "Population", (country) => populations[country])
  .mapColumn("Capital", "Capital River", (capital) => rivers[capital])
```

Where the callback-function's types are restricted to map from string => number.

> :bulb: You can use `.mapColumn` to map from the same column to itself, if you want to modify the values in it.

### Mapping multiple columns
You can also map the values in all existing columns to another one:

```typescript
builder.mapColumns(
    "Country and Capital",
    ({ Country: country, Capital: capital }) => `${country} - ${capital}`
  )
```

## Column options
Columns specifically can have some options configured, which will take presedence over the builder options.

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `priority` | `number` | `Number.MAX_SAFE_INTEGER` | Column priority will determine the column ordering when calling the `.sortColumns` builder method. Lower priority columns will be ordered first. Columns without a set priority will be ordered last. |
| `emptyValue` | `string` \| `null` | `null` | Value to replace empty (`null` \| `undefined`) column values with. Takes precedence over the builder level option. | 
| `removeIfEmpty` | `boolean` | `false` | Remove the column from the resulting CSV, if it only contrains empty (`null` \| `undefined`) values. |
| `transform` | `CSVColumnTransform<Template extends CSVTemplate, Column extends keyof Template>` | `undefined` | Callback function to transform the column values only in the resulting CSV string, but not while building. |


Set the column options in the following way:
```typescript
builder
    .setColumnOptions("Country", { priority: 1 })
    .setColumnOptions("Capital", { priority: 2 })
    .setColumnOptions("Country and Capital", { priority: 3 })
    .setColumnOptions("Capital River", { priority: 4, emptyValue: "N/A" })
    .setColumnOptions("Population", {
        transform: (value: number): string => value.toLocaleString();
      })
```

## Sorting columns

As mentioned in [Column options](#column-options), the column priority will decide the columns position in the final CSV. To actually order the columns, do: 

```typescript
builder.sortColumns()
```

## Dropping columns

In some cases, it is useful to have a column be present as you are building the CSV, for example to make mappings easier, but it should not be included in the final output. For this, you can simply use:
```typescript
builder.dropColumn("Some column")
```
to get rid of the column and the associated column options as well.

## Sorting rows
Sorting rows work in the same fashion as the regular Javascript `Array.prototype.sort()` function, where you have to provide a callback which takes `a: CSVTemplate` and `b: CSVTemplate` and returns a number.

For example, to sort our example by population, we can do:
```typescript
builder
    .sortRows(
        ({ Population: populationA }, { Population: populationB }) =>
          populationB - populationA
      );
```

## Builder concatenation

In some cases, it might come handy to create large CSV files in multiple smaller batches. This is made easy by the ability to concatenate builders with the same template into one.

For example:
```typescript
type CSVTemplate {
    a: string, 
  }

const builder = new CSVBuilder<CSVTemplate>().createColumn("a", ["x"])

const otherBuilder = new CSVBuilder<CSVTemplate>().createColumn("a", ["y"])

builder.concat(otherBuilder)
```

This will mutate the builder which invokes the `.concat` method.
Internal data, column options and builder options will be concatenated. In the case of options, if both builders define options for the same column or the same builder option, the options of the builder invoking `.concat` will take precedence.

## Merging multiple builders

To merge more than 2 builders, it's handy to use the `CSVBuilder.merge` static method. This could especially be useful when the data required for the builders can only be obtained in smaller batches (for example, from a database or API), allowing us to asynchonously create multiple smaller builders and merge them.

For example:
```typescript
const batchIds = [[0, 999], [1000, 1999], [2000, 2999]] // and so on

type CSVTemplate = {
    "User ID": number, 
    "User Email": string,
}
const builders = await Promise.all(batchIds.map(async ([fromId, toId]) => {
    const users = await usersDB.getUsers({fromId, toId})
    return new CSVBuilder<CSVTemplate>()
        .createColumn("User ID", users.map(({id}) => id))
        .createColumn("User Email", users.map(({email}) => email))
}))

const builder = CSVBuilder.merge(...builders)
```

> :warning: Because `CSVBuilder.merge` uses `.concat` under the hood, the builder provided as the first argument will be **mutated** by this.


## Obtaining the CSV
To get the final string result of the built CSV, call `.getString()`.

```typescript
const csvString = builder.getString()
```

## Dimensions
To get number of columns and rows of the resulting CSV, use `.getDimensions()`.

```typescript
const { nRows, nCols } = builder.getDimensions()
```

And to get both the resulting string and the dimensions, call `.getStringAndDimensions()`

```typescript
const [csvString, dims] = builder.getStringAndDimensions()
```


## Full example:
```typescript
import { CSVBuilder } from 'ts-csv-builder'

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

type CSVTemplate = {
    Country: string;
    Capital: string;
    Population: number;
    "Country and Capital": string;
    "Capital River": string | undefined;
  };

const csvString = new CSVBuilder<CSVTemplate>()
  .createColumn('Country', countries)
  .mapColumn("Country", "Capital", (country) => capitals[country])
  .mapColumn("Country", "Population", (country) => populations[country])
  .mapColumn("Capital", "Capital River", (capital) => rivers[capital])
  .mapColumns(
    "Country and Capital",
    ({ Country: country, Capital: capital }) => `${country} - ${capital}`
  )
  .setColumnOptions("Country", { priority: 1 })
  .setColumnOptions("Capital", { priority: 2 })
  .setColumnOptions("Country and Capital", { priority: 3 })
  .setColumnOptions("Capital River", { priority: 4, emptyValue: "N/A" })
  .setColumnOptions("Population", {
        transform: (value: number): string => value.toLocaleString();
  })
  .sortColumns()
  .sortRows(
        ({ Population: populationA }, { Population: populationB }) =>
          populationB - populationA
  )
  .getString();
```


## Dynamic columns
In many cases, you will not know the exact set of columns your CSV file will have at the time of writing your code - columns will need to be created dynamically and the template is not known exactly at compile time.
Sometimes, the naming of dynamic columns may follow some pattern though. If that is the case, [template literaly types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) can still provide some level of type-safety. Take the following example, where we want to produce a CSV containing students' percentile marks, and we want to have a column for each subject they took.

|Student name|...<Class> Final Mark|
|---|---|
John Doe|...final marks|

For this, we can create the following template:
```typescript
type Subject = "Maths" | "Literature" | "Arts"

type Template = {
    "Student name": string, 
    
} & {[K in Subject as `${K} Final Mark`]: number}
```

Or, if you cannot make assertions about the subject, simply do:
```typescript
type Template = {
    "Student name": string, 
    `${string} Final Mark`: number,
}
```

This way typescript will at least help you to make sure your columns are following the correct patterns and will still give you some nice typings.

In case you cannot make any assertions at all about the format of your CSV file, you can simply leave the type variable empty (as it will default to `Record<string, any>`). This way you will unfortunately not have any nice types while writing your code, but you can still use the builder.


