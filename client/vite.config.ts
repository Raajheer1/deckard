import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import VueTypeImports from "vite-plugin-vue-type-imports";
import {fileURLToPath, URL} from "url";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), VueTypeImports()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        watch: {
            usePolling: true,
        },
    },
});