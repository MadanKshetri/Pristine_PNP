import { defineConfig } from "@openapi-codegen/cli";
import {
  generateReactQueryComponents,
  generateSchemaTypes,
} from "@openapi-codegen/typescript";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
console.log("Generating code from BACKEND_URL:", BACKEND_URL);
export default defineConfig({
  api: {
    from: {
      source: "url",
      url: `${BACKEND_URL}/api-json`,
      method: "get",
    },
    outputDir: "./fetchers",
    to: async (context) => {
      const filenamePrefix = "queries";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});