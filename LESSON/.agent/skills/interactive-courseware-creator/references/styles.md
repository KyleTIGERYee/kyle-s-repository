# 课程课件风格指南

## 概述

本指南整合了课程课件的设计风格、UI/UX元素和交互动画，为课程课件提供统一的视觉语言和用户体验标准。采用浅色主题的Claymorphism设计风格。

---

## 通用规范

### 图标与视觉元素

| 规则 | 正确做法 | 错误做法 |
|------|----------|----------|
| **禁止使用emoji图标** | 使用SVG图标（Heroicons、Lucide、Simple Icons） | 使用emoji作为UI图标 |
| **稳定的悬停状态** | 使用颜色/透明度过渡效果 | 使用会导致布局偏移的缩放变换 |
| **正确的品牌图标** | 从Simple Icons获取官方SVG | 猜测或使用错误的图标路径 |
| **一致的图标尺寸** | 使用固定viewBox(24x24)配合w-6 h-6 | 随意混用不同图标尺寸 |

### 交互与光标

| 规则 | 正确做法 | 错误做法 |
|------|----------|----------|
| **光标指针** | 所有可点击/可悬停元素添加`cursor-pointer` | 交互元素保留默认光标 |
| **悬停反馈** | 提供视觉反馈（颜色、阴影、边框） | 无任何交互指示 |
| **平滑过渡** | 使用`transition-colors duration-200` | 瞬时状态变化或过慢(>500ms) |

### 浅色模式对比度

| 规则 | 正确做法 | 错误做法 |
|------|----------|----------|
| **玻璃卡片浅色模式** | 使用`bg-white/80`或更高透明度 | 使用`bg-white/10`（过于透明） |
| **浅色文字对比度** | 使用`#0F172A`(slate-900)作为文字色 | 使用`#94A3B8`(slate-400)作为正文 |
| **弱化文字浅色** | 使用`#475569`(slate-600)或更深 | 使用gray-400或更浅的颜色 |
| **边框可见性** | 浅色模式使用`border-gray-200` | 使用`border-white/10`（不可见） |

---

## 设计系统

### 1. 色彩系统

#### 主色调

| 颜色名称 | 色值 | 用途 | 示例 |
|---------|------|------|------|
| **主色** | `#4F46E5` | 标题、强调、交互元素 | 页面标题、按钮、指示点 |
| **辅色** | `#F0FDF4` | 成功状态、积极信息 | 正确答案、成功提示 |
| **警告色** | `#F59E0B` | 警告信息、提示 | 警告文本、注意事项 |
| **错误色** | `#EF4444` | 错误信息、消极状态 | 错误答案、警告提示 |
| **强调色** | `#8B5CF6` | 特殊强调、高级功能 | 高亮、特殊标记 |

#### 中性色（浅色主题）

| 颜色名称 | 色值 | 用途 | 示例 |
|---------|------|------|------|
| **背景色** | `#EEF2FF` | 页面背景 | 整个页面背景（浅蓝紫色） |
| **卡片色** | `#FFFFFF` | 卡片背景 | 内容卡片、容器（白色） |
| **文本主色** | `#312E81` | 主要文本 | 标题、正文（深靛蓝） |
| **文本辅色** | `#6366F1` | 次要文本 | 说明、提示（靛蓝） |
| **文本弱化色** | `#6B7280` | 弱化文本 | 辅助说明（灰色） |
| **边框色** | `rgba(79, 70, 229, 0.2)` | 边框、分割线 | 卡片边框、分割线 |

### 2. Claymorphism阴影系统

```css
:root {
    /* Claymorphism Shadows */
    --shadow-soft: 8px 8px 16px rgba(79, 70, 229, 0.15), -8px -8px 16px rgba(255, 255, 255, 0.8);
    --shadow-pressed: inset 4px 4px 8px rgba(79, 70, 229, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.9);
    --shadow-float: 12px 12px 24px rgba(79, 70, 229, 0.2), -12px -12px 24px rgba(255, 255, 255, 0.9);
}
```

### 3. 字体系统

#### 字体选择

| 字体名称 | 用途 | 特点 |
|---------|------|------|
| **Baloo 2** | 标题、强调文本 | 圆润友好，适合标题 |
| **Comic Neue** | 正文、说明文本 | 清晰易读，适合长文本 |
| **系统等宽** | 代码、命令 | 等宽字体，适合代码 |

#### 2.0 演示增强版字号规范

| 类名 | 字号 | 行高 | 用途 |
|------|------|------|------|
| `text-hero` | 88px - 120px | 1.1 | 封面主标题 |
| `text-hero-sub` | 40px - 56px | - | 封面副标题 |
| `text-title` | 64px - 80px | 1.2 | 页面大标题 |
| `text-subtitle` | 40px - 48px | 1.3 | 子标题、卡片标题 |
| `text-body` | 28px - 32px | 1.8 | 正文内容 |
| `text-label` | 20px - 24px | - | 标签、徽章、说明文字 |
| `code-block` | 24px | 1.8 | 代码块、提示词示例 |

### 4. 组件风格

#### 卡片样式（Claymorphism浅色主题）

**Claymorphism风格**：
- 圆角：`20px`
- 阴影：`var(--shadow-soft)` 或 `var(--shadow-float)`
- 边框：浅色半透明边框
- 背景：`#FFFFFF`（白色）
- 悬停：上浮效果 + 阴影增强

**示例**：
```html
<div class="interactive-box">
    <!-- 内容 -->
</div>

<style>
.interactive-box {
    background: var(--surface);
    border: 2px solid rgba(79, 70, 229, 0.1);
    border-radius: 20px;
    box-shadow: var(--shadow-soft);
    transition: all 0.3s ease;
    padding: 1.5rem;
}

.interactive-box:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-float);
}
</style>
```

#### 徽章样式

**Clay徽章**：
- 圆角：`rounded-full`
- 边框：主色半透明边框
- 背景：白色
- 字体：`text-label`
- 阴影：`var(--shadow-soft)`

**示例**：
```html
<span class="clay-badge mb-4 text-primary border-primary/50">3.1.1 上下文窗口</span>

<style>
.clay-badge {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    border: 2px solid rgba(79, 70, 229, 0.2);
    background: var(--surface);
    color: var(--primary);
    font-size: 1.25rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-soft);
}

.clay-badge:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-float);
}
</style>
```

#### 按钮样式

**导航按钮**：
- 圆形：`rounded-full`
- 大小：`w-14 h-14`
- 背景：白色
- 边框：主色边框
- 阴影：`var(--shadow-soft)`
- 悬停：背景变主色，文字变白

**示例**：
```html
<button id="nextBtn" class="nav-btn">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
    </svg>
</button>

<style>
.nav-btn {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 9999px;
    background: var(--surface);
    border: 2px solid var(--primary);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
    box-shadow: var(--shadow-soft);
}

.nav-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-float);
    background: var(--primary);
    color: white;
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
}
</style>
```

---

## 页面布局

### 1. 整体结构

```
页面结构（从上到下）：
├── 章节标识（clay-badge）
├── 页面标题（text-title）
├── 主视觉区（占60-70%高度）
│   ├── SVG动画 / 交互组件
│   └── 动态效果区域
├── 辅助说明区（占20-30%高度）
│   └── 简洁文字说明
└── 交互控制区（可选）
    └── 按钮、滑块等
```

### 2. 响应式设计

| 屏幕尺寸 | 布局调整 | 字体调整 | 间距调整 |
|---------|---------|---------|---------|
| **大屏** (>1200px) | 完整布局 | 标准字体 | 标准间距 |
| **中屏** (768-1199px) | 紧凑布局 | 字体缩小10% | 间距缩小10% |
| **小屏** (<767px) | 单列布局 | 字体缩小20% | 间距缩小20% |

### 3. 内容密度

- **文字密度**：不超过页面面积的20%
- **视觉密度**：占页面面积的60-70%
- **空白密度**：占页面面积的10-20%

---

## CSS变量完整定义

```css
:root {
    /* Colors - Claymorphism Education Theme */
    --primary: #4F46E5;
    --primary-light: #818CF8;
    --primary-dark: #3730A3;
    --secondary: #F0FDF4;
    --secondary-light: #34D399;
    --warning: #F59E0B;
    --error: #EF4444;
    --accent: #8B5CF6;
    
    /* 浅色主题背景色 */
    --bg: #EEF2FF;
    --background: #EEF2FF;
    --surface: #FFFFFF;
    --card: #FFFFFF;
    
    /* 文字颜色 */
    --text: #312E81;
    --text-primary: #312E81;
    --text-secondary: #6366F1;
    --text-muted: #6B7280;
    
    /* 边框颜色 */
    --border: rgba(79, 70, 229, 0.2);
    
    /* Claymorphism Shadows */
    --shadow-soft: 8px 8px 16px rgba(79, 70, 229, 0.15), -8px -8px 16px rgba(255, 255, 255, 0.8);
    --shadow-pressed: inset 4px 4px 8px rgba(79, 70, 229, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.9);
    --shadow-float: 12px 12px 24px rgba(79, 70, 229, 0.2), -12px -12px 24px rgba(255, 255, 255, 0.9);
    
    /* Typography */
    --font-display: 'Baloo 2', cursive;
    --font-body: 'Comic Neue', cursive;
    
    /* Spacing */
    --radius-sm: 12px;
    --radius-md: 20px;
    --radius-lg: 28px;
    --radius-xl: 36px;
    
    /* Transitions */
    --transition-fast: 150ms ease-out;
    --transition-normal: 300ms ease-out;
    --transition-slow: 500ms ease-out;
}
```

---

## 交互动画

### 1. 页面切换动画

#### 淡入淡出效果

**实现**：
- 页面切换时的淡入淡出
- 持续时间：0.6秒
- 缓动函数：power3.out

**代码**：
```javascript
function goToSlide(index) {
    if (index < 0 || index >= this.slides.length || CourseState.isAnimating) return;
    
    CourseState.isAnimating = true;
    
    // 当前页面淡出
    gsap.to(this.currentSlide, {
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in'
    });
    
    setTimeout(() => {
        // 切换到新页面
        this.currentSlide.style.display = 'none';
        this.currentSlide.style.opacity = '0';
        
        this.currentSlide = this.slides[index];
        this.currentSlide.style.display = 'block';
        
        // 新页面淡入
        gsap.to(this.currentSlide, {
            opacity: 1,
            duration: 0.3,
            ease: 'power3.out',
            onComplete: () => {
                CourseState.isAnimating = false;
            }
        });
        
        CourseState.currentSlide = index;
        this.updateDisplay();
        this.onSlideChange(index);
    }, 300);
}
```

### 2. 元素入场动画

#### GSAP Stagger动画

**实现**：
- 页面加载时的元素依次入场
- 淡入 + 上移动画
- 交错延迟：0.08秒

**代码**：
```javascript
function animateSlideContent(slide) {
    if (!slide) return;
    
    const elements = slide.querySelectorAll('.interactive-box, .text-title, .text-subtitle, .clay-badge, h2, h3, p, table, .grid > div');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(elements, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.08,
                ease: 'power3.out'
            }
        );
    }
}
```

### 3. 粒子背景动画

#### Canvas粒子系统

**实现**：
- 动态粒子背景
- 粒子间自动连线
- 自适应屏幕大小

**代码**：
```javascript
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 70, 229, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    const particles = [];
    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 25000));
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制连线
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}
```

### 4. 交互反馈动画

#### 悬停效果

**实现**：
- 卡片悬停：缩放 + 阴影
- 按钮悬停：阴影 + 背景变化
- 指示点悬停：放大效果

**代码**：
```css
.interactive-box:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-float);
    transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-float);
    background: var(--primary);
    color: white;
    transition: all 0.2s ease;
}

.slide-dot:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4);
    transition: all 0.2s ease;
}
```

---

## 导航系统

### 1. 底部导航栏

**结构**：
- 左侧：上一页按钮
- 中间：页码显示（当前页/总页数）
- 右侧：下一页按钮

**功能**：
- 自动更新页码
- 首页/末页状态管理
- 响应式适配

### 2. 右侧页面指示点

**结构**：
- 垂直排列的圆形指示点
- 当前页面高亮显示
- 点击跳转到对应页面

**功能**：
- 视觉位置指示
- 快速页面跳转
- 状态同步更新

### 3. 键盘导航

**支持的按键**：
- `↑` `←`：上一页
- `↓` `→` `空格`：下一页
- `Home`：首页
- `End`：末页

### 4. 触摸导航

**支持的手势**：
- 上下滑动：切换页面
- 左右滑动：切换页面
- 点击指示点：跳转到对应页面

---

## 交互组件

### 1. 核心交互组件

#### 框架流程动画

**用途**：展示BROKE、CO-STAR、DAG等框架

**特点**：
- 节点依次出现动画
- 连线动态绘制
- 点击节点查看详情
- 响应式布局

#### 概念关系图谱

**用途**：展示概念之间的关系

**特点**：
- 中心向外扩散动画
- 节点可点击展开
- 关系连线可视化
- 交互式探索

#### Prompt构建器

**用途**：交互式构建提示词

**特点**：
- 组件拖拽组合
- 实时预览效果
- 模板选择
- 一键复制

#### 滑动对比器

**用途**：对比不同提示词效果

**特点**：
- 拖动滑块查看对比
- 平滑过渡效果
- 透明板块隐藏
- 响应式设计

### 2. 辅助交互组件

#### 翻转卡片

**用途**：问答展示、概念解释

**特点**：
- 点击翻转效果
- 正反面内容对比
- 3D翻转动画
- 响应式大小

#### 手风琴折叠

**用途**：FAQ、步骤说明

**特点**：
- 点击展开/折叠
- 平滑过渡动画
- 唯一展开状态
- 可嵌套结构

#### 标签页切换

**用途**：多内容切换

**特点**：
- 点击切换标签
- 内容平滑过渡
- 激活状态指示
- 响应式布局

#### 滑块调节器

**用途**：参数调整、实时反馈

**特点**：
- 实时值更新
- 范围限制
- 视觉反馈
- 触摸支持

---

## 视觉效果

### 1. 光影效果

#### Claymorphism阴影

**实现**：
- 软阴影：用于普通卡片
- 悬浮阴影：用于悬停状态
- 按压阴影：用于按钮按下状态

**示例**：
```css
.interactive-box {
    box-shadow: var(--shadow-soft);
}

.interactive-box:hover {
    box-shadow: var(--shadow-float);
}

.nav-btn:active {
    box-shadow: var(--shadow-pressed);
}
```

### 2. 渐变效果

#### 线性渐变

**用途**：
- 背景装饰
- 按钮效果
- 强调区域
- 视觉引导

**示例**：
```css
.gradient-bg {
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(129, 140, 248, 0.1) 100%);
}
```

#### 径向渐变

**用途**：
- 焦点突出
- 背景装饰
- 发光效果
- 视觉中心

**示例**：
```css
.radial-glow {
    background: radial-gradient(circle at center, rgba(79, 70, 229, 0.2) 0%, transparent 70%);
}
```

### 3. 动效节奏

#### 动画时序

| 元素类型 | 入场时间 | 动画时长 | 缓动函数 |
|---------|---------|---------|---------|
| **标题** | 0s | 0.6s | back.out(1.7) |
| **SVG动画** | 0.2s | 1.2s | power2.out |
| **卡片** | 0.4s | 0.5s | power3.out |
| **文本** | 0.6s | 0.4s | power1.out |
| **按钮** | 0.8s | 0.3s | power1.out |

#### 交互响应

| 交互类型 | 响应时间 | 动画时长 | 反馈方式 |
|---------|---------|---------|---------|
| **点击** | 0s | 0.2s | 缩放 + 颜色变化 |
| **悬停** | 0s | 0.3s | 阴影 + 位置变化 |
| **拖动** | 0s | 0s | 实时跟随 |
| **滚动** | 0s | 0.5s | 渐显 + 上移 |

---

## 性能优化

### 1. 动画性能

#### GPU加速

- 使用 `transform` 和 `opacity` 进行动画
- 添加 `will-change` 提示
- 避免布局抖动

**示例**：
```css
.animated-element {
    will-change: transform, opacity;
    transform: translateZ(0);
}
```

#### 帧率优化

- 使用 `requestAnimationFrame`
- 合理使用GSAP的时间线
- 避免过度动画

### 2. 加载性能

#### 懒加载

- 非当前页内容延迟初始化
- 图片资源懒加载
- 组件按需加载

#### 资源优化

- SVG优化（去除无用代码）
- 代码压缩
- 资源缓存

### 3. 交互性能

#### 事件处理

- 使用事件委托
- 节流和防抖
- 及时清理事件监听器

**示例**：
```javascript
// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function() {
        const args = arguments;
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
```

---

## 可访问性

### 1. 键盘导航

- 所有交互元素可通过键盘访问
- 清晰的焦点状态
- 符合WCAG标准的键盘操作

### 2. 屏幕阅读器

- 语义化HTML结构
- 适当的ARIA属性
- 文本替代方案

### 3. 颜色对比度

- 文本与背景对比度 ≥ 4.5:1
- 交互元素对比度 ≥ 3:1
- 符合WCAG AA标准

### 4. 动画控制

- 尊重 `prefers-reduced-motion`
- 提供动画关闭选项
- 确保核心功能无动画也可使用

**示例**：
```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

---

## 实施指南

### 1. 开发流程

#### 设计阶段

1. **风格定义**：确定色彩、字体、布局
2. **组件设计**：设计核心交互组件
3. **动画规划**：定义动画类型和触发时机
4. **原型测试**：验证设计效果

#### 开发阶段

1. **搭建框架**：创建基础HTML结构
2. **实现样式**：应用设计系统
3. **添加交互**：实现核心功能
4. **集成动画**：添加视觉效果
5. **测试优化**：性能和兼容性测试

### 2. 代码规范

#### HTML规范

- 语义化标签
- 一致的命名约定
- 响应式设计
- 可访问性属性

#### CSS规范

- 模块化组织
- 一致的命名约定
- 性能优化
- 浏览器兼容性

#### JavaScript规范

- 模块化设计
- 清晰的命名
- 错误处理
- 性能优化

### 3. 测试策略

#### 功能测试

- 所有交互功能
- 导航系统
- 响应式布局
- 动画效果

#### 性能测试

- 页面加载速度
- 动画流畅度
- 内存使用
- 交互响应时间

#### 兼容性测试

- 主流浏览器
- 不同设备
- 辅助技术
- 网络条件

---

## 最佳实践

### 1. 设计最佳实践

- **一致性**：保持视觉元素的一致性
- **层次**：建立清晰的视觉层次
- **反馈**：提供明确的交互反馈
- **简约**：避免过度设计
- **专注**：突出核心内容

### 2. 交互最佳实践

- **直观**：交互方式符合用户预期
- **响应**：提供及时的视觉反馈
- **容错**：允许用户犯错并轻松纠正
- **引导**：引导用户完成复杂任务
- **效率**：减少完成任务的步骤

### 3. 动画最佳实践

- **目的**：动画服务于内容理解
- **适度**：避免过度动画
- **流畅**：保持动画流畅性
- **性能**：优化动画性能
- **可访问**：尊重用户偏好

### 4. 开发最佳实践

- **模块化**：代码组织清晰
- **可维护**：易于理解和修改
- **可扩展**：便于添加新功能
- **性能**：注重代码性能
- **文档**：完善的注释和文档

---

## 案例研究

### 第一课：大模型+提示词基础

**核心设计元素**：
- BROKE框架SVG动画
- 提示词构建器
- 滑动对比器
- 高亮扫描效果

**视觉特点**：
- 浅色主题（#EEF2FF背景）
- Claymorphism卡片设计
- 交互式学习体验
- 清晰的概念展示

### 第二课：提示词工程进阶

**核心设计元素**：
- CO-STAR框架动画
- 多步骤流程
- 交互式示例
- 实时反馈系统

**视觉特点**：
- 浅色主题
- 渐进式动画
- 分层设计
- 动态交互效果

### 第三课：上下文工程

**核心设计元素**：
- Token计算器
- 上下文窗口演示
- 注意力稀释动画
- 记忆系统对比

**视觉特点**：
- 浅色主题
- 数据可视化
- 实时计算
- 粒子背景效果

---

## 总结

本风格指南为课程课件提供了统一的设计语言和用户体验标准，采用浅色主题的Claymorphism设计风格。通过遵循这些规范，可以确保课件在视觉上保持一致性，在交互上提供流畅的用户体验，在技术上实现高性能的动画效果。

关键要点：

1. **浅色主题设计**：背景色#EEF2FF，卡片白色，文字深靛蓝
2. **Claymorphism风格**：柔和的阴影、圆角、悬浮效果
3. **流畅的交互动画**：页面切换、元素入场、交互反馈
4. **响应式布局**：适配不同设备
5. **高性能实现**：动画优化、加载优化
6. **可访问性**：键盘导航、屏幕阅读器支持

通过应用这些设计原则，可以创建出视觉吸引力强、用户体验流畅、教育效果显著的课程课件。

---

## 交付前检查清单

在交付课件代码前，请验证以下项目：

### 视觉质量
- [ ] 未使用emoji作为图标（使用SVG替代）
- [ ] 所有图标来自一致的图标集（Heroicons/Lucide）
- [ ] 品牌图标正确（从Simple Icons验证）
- [ ] 悬停状态不会导致布局偏移
- [ ] 使用主题颜色（bg-primary）而非var()包装

### 交互
- [ ] 所有可点击元素具有`cursor-pointer`
- [ ] 悬停状态提供清晰的视觉反馈
- [ ] 过渡动画平滑（150-300ms）
- [ ] 键盘导航的焦点状态可见

### 浅色模式
- [ ] 浅色文字具有足够对比度（4.5:1最小值）
- [ ] 玻璃/透明元素在浅色模式下可见
- [ ] 边框在两种模式下均可见
- [ ] 交付前测试两种模式

### 布局
- [ ] 浮动元素与边缘保持适当间距
- [ ] 无内容被固定导航栏遮挡
- [ ] 在375px、768px、1024px、1440px响应式测试
- [ ] 移动端无水平滚动

### 可访问性
- [ ] 所有图片具有alt文本
- [ ] 表单输入具有标签
- [ ] 颜色不是唯一指示器
- [ ] 尊重`prefers-reduced-motion`
