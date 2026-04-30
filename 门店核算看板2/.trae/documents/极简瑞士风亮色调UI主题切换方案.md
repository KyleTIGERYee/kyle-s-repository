## 实施计划：极简瑞士风亮色调UI

### 设计规范

| 元素 | 亮色主题 | 暗色主题(保持原有) |
|------|----------|-------------------|
| 主背景 | `bg-slate-50` (#F8FAFC) | `bg-slate-950` |
| 卡片背景 | `bg-white` | `bg-slate-900/40` |
| 主强调色 | `blue-500` (#3B82F6) | `cyan-500` |
| 次强调色 | `blue-400` (#60A5FA) | `cyan-400` |
| CTA按钮 | `orange-500` (#F97316) | `cyan-500` |
| 主文字 | `slate-800` (#1E293B) | `slate-200` |
| 次文字 | `slate-500` | `slate-400` |
| 边框 | `slate-200` | `white/10` |
| 阴影 | `shadow-sm` | 霓虹发光 |

### 实施步骤

#### 1. 创建主题系统
- 新建 `contexts/ThemeContext.tsx`
- 定义 `ThemeContext` 和 `useTheme` hook
- 支持 `light` / `dark` 两种主题
- localStorage 持久化用户偏好

#### 2. 更新 index.html
- 添加 Google Fonts (Poppins + Open Sans)
- 添加亮色主题滚动条样式
- 添加主题过渡动画 CSS

#### 3. 更新 App.tsx
- 集成 ThemeProvider
- 在 Sidebar 右上角添加主题切换按钮
- 更新 Sidebar 样式支持双主题
- 更新 BottomNav 样式支持双主题
- 更新加载状态组件样式

#### 4. 更新各页面组件
- **Dashboard.tsx**: 更新所有卡片、表格、弹窗样式
- **StoreOverview.tsx**: 更新 KPI 卡片、图表、弹窗样式
- **Benchmark.tsx**: 更新对比表格、弹窗样式
- **AIChat.tsx**: 更新聊天界面样式
- **TrendAnalysis.tsx**: 更新图表容器、数据表格样式

#### 5. 样式转换规则
```
暗色 → 亮色映射：
- bg-slate-950 → bg-slate-50
- bg-slate-900/40 → bg-white
- text-slate-200 → text-slate-800
- text-slate-400 → text-slate-500
- text-cyan-400 → text-blue-500
- border-white/10 → border-slate-200
- shadow-[霓虹] → shadow-sm
```

### 主题切换按钮位置
- 桌面端：Sidebar 底部或顶部 Logo 旁
- 移动端：Header 右侧

### 预期效果
- ✅ 保持所有组件位置不变
- ✅ 平滑过渡动画 (300ms)
- ✅ 用户偏好持久化
- ✅ WCAG AAA 级无障碍对比度