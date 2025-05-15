// import react from "@vitejs/plugin-react";
// import { defineConfig } from "vite";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000', // Địa chỉ backend của bạn
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '/api'), // Chuyển tiếp đúng các yêu cầu API
//       },
//     },
//   },
// });


import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path"; // <-- thêm dòng này

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <-- cấu hình alias
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
