import { defineConfig, globalIgnores } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      boundaries
    },
    settings: {
      "boundaries/elements": [
        { type: "features", pattern: "src/features/*" },
        { type: "shared", pattern: "src/shared/*" },
        { type: "app", pattern: "src/app/*" },
        { type: "infrastructure", pattern: "src/infrastructure/*" }
      ]
    },
    rules: {
      "boundaries/element-types": [2, {
        default: "allow",
        rules: [
          {
            from: ["features"],
            disallow: ["app"],
          },
          {
            from: ["shared"],
            disallow: ["features", "app", "infrastructure"],
          },
          {
            from: ["infrastructure"],
            disallow: ["features", "app"]
          }
        ]
      }],
      "no-restricted-imports": ["error", {
        "patterns": [{
          "group": ["@/features/*/*"],
          "message": "Deep imports from features are not allowed. Import from the feature's public API (index.ts) instead."
        }]
      }]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
