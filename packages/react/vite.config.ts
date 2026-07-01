import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "index.js"
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "@ccais/embedded-chatbot-core"]
    },
    sourcemap: true
  }
});
