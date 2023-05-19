module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2021
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "semi": "error",
    "no-unused-vars": [
      "warn",
      {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": false
      }
    ],
    "no-unused-expressions": "warn",
    "no-unused-labels": "warn",
    "quotes": [
      "warn",
      "single"
    ]
  }
};
