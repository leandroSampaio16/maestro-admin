import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "simple-import-sort": (await import("eslint-plugin-simple-import-sort"))
        .default,
    },
    rules: {
      "no-const-assign": "warn",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^react$", "^@?\\w"],
            ["^@", "^"],
            ["^\\./"],
            ["^.+\\.(module.css|module.scss)$"],
            ["^.+\\.(gif|png|svg|jpg)$"],
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
