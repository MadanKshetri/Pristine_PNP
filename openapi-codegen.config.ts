import { defineConfig } from "@openapi-codegen/cli";
import {
  generateReactQueryComponents,
  generateSchemaTypes,
} from "@openapi-codegen/typescript";

// const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
const BACKEND_URL = "https://cmsapi.poudelsudeep.com.np";

console.log("Generating code from BACKEND_URL:", BACKEND_URL);
export default defineConfig({
  api: {
    from: {
      source: "url",
      url: `${BACKEND_URL}/api-json`,
      headers: {
        //TODO: use env
        Authorization: `Basic YWRtaW46cGFzc3dvcmQ=`,
      },
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
