import { defineConfig } from "@openapi-codegen/cli";
import {
    generateReactQueryComponents,
    generateSchemaTypes,
} from "@openapi-codegen/typescript";
export default defineConfig({
  api: {
    from: {
      source: "url",
      url: "https://cmsapi.centralindia.cloudapp.azure.com/api-json",
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