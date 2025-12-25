import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import obsidianmd from "eslint-plugin-obsidianmd";

const tsFiles = ["**/*.ts", "**/*.tsx"];

// Extract Obsidian-specific rules from the plugin's recommended config
// This works because the recommended config object exposes rules as own properties
const obsidianRules = { ...obsidianmd.configs.recommended };

export default [
  {
    ignores: ["dist/", "node_modules/", "eslint.config.mjs", "esbuild.config.mjs", "main.js", "marginalia/", "coverage/", "**/*.d.ts", "package.json", "package-lock.json"],
  },
  {
    // Global config
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  {
    files: tsFiles,
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      obsidianmd,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Apply Obsidian rules
      ...obsidianRules,

      // User overrides and strict checks
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
]
