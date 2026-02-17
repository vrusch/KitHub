import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json"; // Importujeme package.json

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Tady "vstříkneme" verzi do aplikace jako globální proměnnou
    // Musíme použít JSON.stringify, aby se do kódu vložila jako řetězec "2.30.0"
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
  },
  build: {
    chunkSizeWarningLimit: 1000, // Zvedne limit varování na 1000 kB (1 MB)
  },
});
