import Inspect from "vite-plugin-inspect";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [Inspect()],
    esbuild: {
        jsxDev: false
    }
});