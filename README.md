# babel-plugin-jsx-text-extract

Extract text from JSXText nodes into separate file

## Installation

```sh
$ npm install babel-plugin-jsx-text-extract
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["jsx-text-extract"]
}
```

### Via CLI

```sh
$ babel --plugins jsx-text-extract script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["jsx-text-extract"]
});
```
