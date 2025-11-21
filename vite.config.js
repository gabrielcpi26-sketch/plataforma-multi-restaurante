import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚙️ Configuración de Vite para permitir acceso desde el celular
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // ✅ permite entrar desde otros dispositivos en la red
    port: 5173,      // ✅ usamos el mismo puerto que ya tienes
  },
});

