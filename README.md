# ZenStack Markdown Plugin

ZenStack Markdown Plugin is a standard plugin of [ZenStack](https://github.com/zenstackhq/zenstack) to generate markdown from the ZModel schema with Mermaid ERD diagram.

## Example

-   [Post](#Post)
-   [User](#User)

### Post

```mermaid
erDiagram
"Post" {
  String id PK
  DateTime createdAt
  DateTime updatedAt
  String title
  Boolean published
  String authorId FK
}
"Post" }o--|| "User": author
```

-   CREATE
    -   ✅auth() == author
-   READ
    -   ✅auth() == author
    -   ✅auth() != null && published
-   UPDATE
    -   ✅auth() == author
-   DELETE
    -   ✅auth() == author

### User

```mermaid
erDiagram
"User" {
  String id PK
  String name  "nullable"
  String email  "nullable"
  DateTime emailVerified  "nullable"
  String password
  String image  "nullable"
}
"User" ||--o{ "Post": posts
```

-   CREATE
    -   ✅true
-   READ
    -   ✅true
-   UPDATE
    -   ✅auth() == this
-   DELETE
    -   ✅auth() == this

## Setup

```bash
npm i -D zenstack-markdown
```

add the plugin in your ZModel schema file

```ts
plugin zenstackmd {
    provider = 'zenstack-markdown'
}
```

run zenstack generate

```bash
npx zenstack generate
```

you will see the `schema.md` generated in the same folder of your ZModel schema file.

## Options

| Name     | Type    | Description                                       | Required | Default   |
| -------- | ------- | ------------------------------------------------- | -------- | --------- |
| output   | String  | Output file path (relative to the path of ZModel) | No       | schema.md |
| disabled | Boolean | Whether to run this plugin                        | No       | false     |

example:

```ts
plugin zenstackmd {
    provider = 'zenstack-markdown'
    output = 'docs/schema.md'
    disabled = true
}
```

You can also disable it using env variable

```bash
DISABLE_ZENSTACK-MD=true
```

## Local Development

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

After build, the plugin will be generated in `dist` folder. Then you can use it in your existing ZModel schema by setting the `provider` this `dist` folder

```ts
plugin zenstackmd {
    provider = '.../zenstack-markdown/dist'
}
```

`provider` could either by the absolute path or relative path to the running `zenstack` module.

### Run Sample

simply run `npm run dev` to see a more complicated result [schema.md](./schema.md) generated from [schema.zmodel](./schema.zmodel)
