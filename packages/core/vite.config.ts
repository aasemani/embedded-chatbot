import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "ccais-embedded-chatbot.js"
    },
    sourcemap: true
  }
});
