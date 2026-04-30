import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, '.', '');
    const apiBaseUrl = env.VITE_API_BASE_URL;

    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
            proxy: {
                '/api': {
                    target: apiBaseUrl,
                    changeOrigin: true,
                    secure: false,
                },
                '/web/api': {
                    target: apiBaseUrl,
                    changeOrigin: true,
                    secure: false,
                }
            }
        },

        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },

        // 构建优化配置
        build: {
            // 启用压缩大小报告
            reportCompressedSize: true,
            // 设置 chunk 大小警告阈值 (echarts vendor is ~1MB, acceptable for lazy-loaded vendor)
            chunkSizeWarningLimit: 1200,
            // Rollup 输出配置
            rollupOptions: {
                output: {
                    // 代码分割策略 - 按依赖包分割
                    manualChunks: {
                        // React 核心库
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                        // 数据查询库
                        'query-vendor': ['@tanstack/react-query'],
                        // 图表库
                        'chart-vendor': ['recharts'],
                        // Markdown 渲染库
                        'markdown-vendor': ['react-markdown', 'remark-gfm'],
                        // 图标库
                        'ui-vendor': ['lucide-react'],
                        // ECharts 图表库 (大型库，单独分包)
                        'echarts-vendor': ['echarts'],
                    },
                    // 资源文件命名规则
                    assetFileNames: (assetInfo) => {
                        const info = assetInfo.name.split('.');
                        const ext = info[info.length - 1];
                        // 根据文件类型分配到不同目录
                        if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
                            return 'assets/images/[name]-[hash][extname]';
                        }
                        if (/\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
                            return 'assets/fonts/[name]-[hash][extname]';
                        }
                        if (ext === 'css') {
                            return 'assets/css/[name]-[hash][extname]';
                        }
                        return 'assets/[name]-[hash][extname]';
                    },
                    // JS chunk 命名规则
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    // 入口文件命名规则
                    entryFileNames: 'assets/js/[name]-[hash].js',
                },
            },
            // 启用源码映射（生产环境可关闭）
            sourcemap: mode === 'development',
            // 压缩配置
            minify: 'terser',
            terserOptions: {
                compress: {
                    // 删除 console 和 debugger
                    drop_console: mode === 'production',
                    drop_debugger: mode === 'production',
                    // 压缩级别
                    passes: 2,
                },
                mangle: {
                    // 压缩变量名
                    safari10: true,
                },
                format: {
                    // 删除注释
                    comments: false,
                },
            },
        },

        // 依赖预构建优化
        optimizeDeps: {
            // 预构建包含的依赖
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                '@tanstack/react-query',
                'recharts',
                'lucide-react',
            ],
            // 排除某些依赖的预构建
            exclude: [],
        },

        // 性能优化：预加载关键资源
        experimental: {
            // 启用 renderBuiltUrl 以支持 CDN 配置
            renderBuiltUrl(filename, {hostType}) {
                // 可以在这里配置 CDN 路径
                return {relative: true};
            },
        },
    };
});
