import { defineConfig } from "vite";

export default defineConfig({
    base: "/control-horas-extras/",
    server: {
        port: 5173,
        strictPort: true
    }
});