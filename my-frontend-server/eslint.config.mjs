import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/performance/**/*.{ts,tsx}", "**/hooks/useAdvancedPerformance.ts", "**/hooks/usePerformanceOptimizations.ts", "**/hooks/useSmartCaching.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "import/no-anonymous-default-export": "warn",
      "react/display-name": "warn",
      "@next/next/no-img-element": "warn"
    }
  }
];

export default eslintConfig;
