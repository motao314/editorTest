import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import jsx from '@vitejs/plugin-vue-jsx';
import postcssInset from 'postcss-inset';

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: /\.png$/,
  base: '/',
  plugins: [vue(), jsx()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        edit: resolve(__dirname, 'edit.html'),
      }
    }, // 设置最终构建的浏览器兼容目标
    target: 'es2015',
    // 构建后是否生成 source map 文件
    sourcemap: false,
    //  chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 2000,
    // 启用/禁用 gzip 压缩大小报告
    reportCompressedSize: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/editPage/src')
    },
  }, //配置sass
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: 'true; @import "@/assets/less/globalVar.less"; @import "@/assets/less/globalMixin.less"',
        },
        javascriptEnabled: true,
      },
    },
    postcss: {
      plugins: [postcssInset()],
    },
  },

  server: {
    // 是否开启 https
    https: false,
    // 端口号
    port: 3000,
    // 监听所有地址
    host: '0.0.0.0',
    // 服务启动时是否自动打开浏览器
    open: true,
    // 允许跨域
    cors: true,
    // 自定义代理规则
    proxy: {
      '/api': {
        // target: 'https://2deditor.ele007.com', // 后台测试环境接口
        // target: "http://192.168.1.59:8083", // 泽民
        // target: "http://192.168.1.61:8083", // 红申
        // target: "http://os.ele007.com", // 后台线上环境接口
        // target: "http://pceditor-isv.ele007.com/", // 诸老大 线上
        //target: 'https://pceditor.ele007.com/', //  线上
        // target: "http://192.168.1.204:8083", // 204
        //target: 'http://192.168.1.211:8083', // 211
        // target: 'https://os211.ele007.com',
         target: 'https://pceditor.ele007.com/', //  线上

        changeOrigin: true, // 是否允许跨域
        secure: true, // 如果是https接口，需要配置这个参数
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
})
