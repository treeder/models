# models

A secondary JSON parser to turn fields into concrete objects.

After a `JSON.parse(s)`, run this with `parseModel(ob)` to turn fields into objects, like so:

```js
let ob = JSON.parse(s)
ob = parseModel(ob, User)
```

## Getting Started

```sh
npm install treeder/models
```

Or in your browser:

```js
import {parseModel} from 'https://cdn.jsdelivr.net/gh/treeder/models@1/index.js'
```

First define your models. You may find this familiar if you use [Lit](https://lit.dev). And these models can be used for [migrations](https://github.com/treeder/migrations), for SQLite and Cloudflare D1 via [flaregun](https://github.com/treeder/flaregun), and for the handy [api](https://github.com/treeder/api) library. 


```js
export class User {
  static properties = {
    id: {
      type: String,
      primaryKey: true,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    data: {
      type: Object,
      // you can go deeper into Object properties, only required if you don't want JSON defaults.
      birthday: {
        type: Date,
      }
    },
  }
}
```

Use standard JavaScript classes:

- String
- Number
- Boolean
- Date
- BigInt
- Object

To use a custom parser, use `parse` instead of `type`:

```js
{
  balance: {
    parse: (n) => (n ? new Big(n) : new Big(0)),
  },
}
```

Then call `parseModel()` with your object and your new class. 

```js
let ob = JSON.parse(s)
ob = parseModel(ob, User)
```

That's it!
