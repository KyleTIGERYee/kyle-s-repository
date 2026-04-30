import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initWebVitals } from './utils/performance';

// 初始化 Web Vitals 性能监控
// 在生产环境启用调试，开发环境可以关闭
initWebVitals({
  debug: import.meta.env.DEV,
  onReport: (metric) => {
    // 可以在这里将性能指标上报到分析服务
    // 例如：发送到自建的监控系统或第三方服务
    if (import.meta.env.PROD) {
      // 生产环境上报到分析服务
      // 示例：sendToAnalytics(metric);
    }
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
