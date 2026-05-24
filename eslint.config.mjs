import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "packages/*/node_modules/**",
      "packages/*/dist/**",
      "mzizi-mcp/node_modules/**",
      "mzizi-mcp/dist/**",
      "public/**",
      "scripts/**",
      "supabase/**",
      "*.config.*",
      "vitest.setup.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Node CLI packages — `console` IS the UI surface, and `process` is
    // the standard environment accessor. Both are first-class Node globals
    // and should be allowed unconditionally inside CLI tooling. The shadcn
    // / commander / clack CLIs all do the same.
    files: ["packages/design-cli/**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        fetch: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  }
)
