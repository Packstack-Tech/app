module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "simple-import-sort", "prettier"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-empty-pattern": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": "error",
    "simple-import-sort/imports": [
      "warn",
      {groups: [["^\\u0000"], ["^react", "^\\w", "^@?\\w"], ["^@?\\/"], ["^\\."]]}
    ],
    "simple-import-sort/exports": "warn"
  },
}
