// apps/your-angular-app/vite.config.ts
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular'; // nếu bạn dùng Analog hoặc Angular với Vite

export default defineConfig({
  plugins: [angular()],
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ tất cả các địa chỉ IP
    port: 4200, // Đặt port cố định
    strictPort: true, // Không tự động đổi port nếu port này đã được sử dụng
    cors: true, // Bật CORS
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
});
