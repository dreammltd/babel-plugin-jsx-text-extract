# babel-plugin-text-extract

Extract text from JSXText nodes into separate file

## Installation

```sh
$ npm install babel-plugin-text-extract
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["text-extract"]
}
```

### Via CLI

```sh
$ babel --plugins text-extract script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["text-extract"]
});
```
