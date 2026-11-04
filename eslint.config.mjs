import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Código instalado pelos registries (shadcn/studio): reinstalações sobrescrevem
  // correções manuais, então essas regras viram aviso só nessas pastas.
  {
    files: ["src/components/ui/**", "src/components/shadcn-studio/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // App mobile (Expo): tem lint e tsconfig próprios
    "mobile/**",
  ]),
]);

export default eslintConfig;
