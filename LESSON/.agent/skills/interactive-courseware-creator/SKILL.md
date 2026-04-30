---
name: "interactive-courseware-creator"
description: "根据讲义内容创建图文并茂的交互式网页课件。当用户提到'制作课件'、'创建课程'、'生成网页演示'、'做PPT/幻灯片'、'课程可视化'、'交互式课件'时触发。提供HTML+TailwindCSS+GSAP技术栈的课件生成能力，包含幻灯片导航、SVG动画、交互组件库。"
---

# 交互式课件制作技能

## 快速开始

### 技术栈
- HTML5 + TailwindCSS
- GSAP动画库
- 原生JavaScript
- Canvas粒子系统
- SVG动画

### 制作流程

```
1. 分析讲义内容 → 确定适合的可视化方式
2. 选择对应组件 → 从 references/ 目录查找组件代码
3. 填充讲义内容 → 替换示例数据为讲义原文
4. 调整动画参数 → 根据内容复杂度调整
5. 测试交互效果 → 确保流畅性和可读性
```

---

## 组件选择指南

根据内容类型选择合适的组件：

| 讲义内容类型 | 传统方式 | 增强方式 | 推荐组件 | 参考文件 |
|-------------|---------|---------|---------|---------|
| **框架介绍** | 表格罗列 | 动画流程图 | 框架流程动画 | components-enhanced.md |
| **概念解释** | 文字描述 | 交互式图谱 | 概念关系图谱 | components-enhanced.md |
| **对比说明** | 左右分栏 | 分栏对比卡片 | **Side-by-Side Cards** | components-basic.md |
| **效果演示** | 视频/动图 | 滑动对比器 | Before/After Slider | components-enhanced.md |
| **代码示例** | 代码块 | 高亮扫描 | 高亮扫描效果 | components-enhanced.md |
| **对话示例** | 引用块 | 打字机效果 | 打字机效果 | components-enhanced.md |
| **实践操作** | 步骤说明 | 交互构建器 | Prompt构建器 | components-enhanced.md |
| **简单概念** | 文字描述 | 卡片翻转 | 翻转卡片 | components-basic.md |
| **FAQ/步骤** | 列表 | 手风琴 | 手风琴折叠 | components-basic.md |
| **分类展示** | 分节 | 标签页 | 标签页切换 | components-basic.md |
| **流程说明** | 文字描述 | 步骤流程 | 步骤流程图 | components-basic.md |
| **知识检测** | 问答 | 交互测验 | 选择题/判断题 | components-basic.md |

---

## 核心原则

### 1. 严格遵循讲义
- **所有内容必须来自讲义原文**，不自行发挥
- 按照讲义的章节结构组织页面
- 使用讲义中的例子和数据
- 不添加讲义中没有的概念

### 2. 视觉优先
- **能用动画展示的，不用文字堆砌**
- 每页必须有至少一个视觉焦点
- 文字与视觉元素比例约 **20:80**

### 3. 渐进式揭示
- 复杂概念分步骤动画展示
- 避免一次性呈现过多信息
- 引导学习者的注意力流动

### 4. 交互即学习
- 每个核心概念配一个交互演示
- 提供即时反馈，强化理解
- 让学习者通过操作来探索概念

### 5. 专业视觉准则 (NEW)
- **严格去 Emoji 化**：严禁在正式课件中使用 Emoji（如 ✅, ❌, 🧠）。
- **全量 SVG 集成**：使用 inline SVG 代替图标。图标应具备语义色（如报错用 red-500，成功用 green-500）。
- **超大字号适配**：面向大型投屏演示优化，确保正文在所有设备上具备极高的可读性。
- **具象化技术模型**：涉及数学或架构概念时，应绘制精准的几何图或坐标系 SVG。

---

## 页面结构模板

```html
<section class="slide" data-index="0">
    <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
        <!-- 1. 章节标识 -->
        <span class="text-label text-accent">章节编号</span>
        
        <!-- 2. 页面标题 -->
        <h2 class="font-display text-title font-bold">页面标题</h2>
        
        <!-- 3. 主视觉区（占60-70%高度） -->
        <div class="visual-component">
            <!-- 从组件文档复制对应组件 -->
        </div>
        
        <!-- 4. 辅助说明区（可选） -->
        <div class="supplementary-info">
            <!-- 简洁文字说明 -->
        </div>
    </div>
</section>
```

---

## 设计规范速查

### 统一字号标准 (2.0 演示增强版)

| 类名 | 字号 | 用途 |
|------|------|------|
| `text-hero` | 88px - 120px | 封面/巨幕主标题 |
| `text-hero-sub` | 40px - 56px | 封面副标题 / Slogan |
| `text-title` | 64px - 80px | 页面大标题 |
| `text-subtitle` | 40px - 48px | 子标题、卡片头部 |
| `text-body` | 28px - 32px | 正文内容、段落文本 |
| `text-label` | 20px - 24px | 标签、微型 UI 说明 |
| `code-block` | 24px | 代码块 / 算法公式 |

### 布局规范
```css
.slide-content { 
    width: 95% !important; 
    max-width: 1600px !important; 
}
```

---

## 核心组件代码库

以下是最常用的课件组件完整代码，可直接复制使用。

### 1. CSS 变量定义

```css
:root {
    /* Colors - Claymorphism Education Theme */
    --primary: #4F46E5;
    --primary-light: #818CF8;
    --primary-dark: #3730A3;
    --secondary: #F0FDF4;
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
    
    /* Radius */
    --radius-sm: 12px;
    --radius-md: 20px;
    --radius-lg: 28px;
}
```

### 2. 幻灯片基础结构

```html
<!-- 幻灯片容器 -->
<div id="slides-container" class="relative w-full h-full">
    <section class="slide active" data-index="0">
        <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
            <!-- 页面内容 -->
        </div>
    </section>
</div>

<!-- 导航控制 -->
<div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
    <button id="prevBtn" onclick="prevSlide()" class="nav-btn">←</button>
    <div class="slide-counter">
        <span id="currentSlide">1</span> / <span id="totalSlides">10</span>
    </div>
    <button id="nextBtn" onclick="nextSlide()" class="nav-btn">→</button>
</div>

<!-- 进度条 -->
<div class="fixed bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
    <div id="progressBar" class="h-full bg-primary transition-all duration-500"></div>
</div>
```

### 3. 幻灯片导航 JavaScript

```javascript
// 全局状态
let currentSlide = 0;
let totalSlides = 0;

// 初始化
function initSlides() {
    const slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    document.getElementById('totalSlides').textContent = totalSlides;
    updateSlideDisplay();
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
}

// 更新幻灯片显示
function updateSlideDisplay() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
            slide.style.opacity = '1';
            slide.style.visibility = 'visible';
        } else {
            slide.classList.remove('active');
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
        }
    });
    
    // 更新页码
    document.getElementById('currentSlide').textContent = currentSlide + 1;
    
    // 更新进度条
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // 更新按钮状态
    document.getElementById('prevBtn').disabled = currentSlide === 0;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
}

// 下一页
function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlideDisplay();
    }
}

// 上一页
function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlideDisplay();
    }
}

// 键盘控制
function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            prevSlide();
            break;
        case 'Home':
            e.preventDefault();
            currentSlide = 0;
            updateSlideDisplay();
            break;
        case 'End':
            e.preventDefault();
            currentSlide = totalSlides - 1;
            updateSlideDisplay();
            break;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initSlides);
```

### 4. 基础交互组件

#### 4.1 翻转卡片 (Flip Card)

**用途**：问答、概念解释、前后对比

```html
<div class="flip-card" onclick="flipCard(this)">
    <div class="flip-card-inner">
        <div class="flip-card-front">
            <h3>什么是Token？</h3>
            <p>点击查看答案</p>
        </div>
        <div class="flip-card-back">
            <p>Token是模型处理文本的基本单位...</p>
        </div>
    </div>
</div>
```

```css
.flip-card {
    perspective: 1000px;
    width: 300px;
    height: 200px;
    cursor: pointer;
}
.flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}
.flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
}
.flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.flip-card-front {
    background: var(--surface);
    border: 2px solid var(--primary);
    box-shadow: var(--shadow-soft);
}
.flip-card-back {
    background: var(--primary);
    color: white;
    transform: rotateY(180deg);
}
```

```javascript
function flipCard(card) {
    card.classList.toggle('flipped');
}
```

#### 4.2 手风琴折叠 (Accordion)

**用途**：FAQ、分步骤说明、详细解释

```html
<div class="accordion">
    <div class="accordion-item">
        <button class="accordion-header" onclick="toggleAccordion(this)">
            <span>步骤1：数据预处理</span>
            <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
            <p>详细说明数据预处理的过程...</p>
        </div>
    </div>
</div>
```

```css
.accordion {
    width: 100%;
    max-width: 800px;
}
.accordion-item {
    border-bottom: 1px solid var(--border);
}
.accordion-header {
    width: 100%;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--surface);
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: var(--text);
}
.accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    padding: 0 1rem;
}
.accordion-item.active .accordion-content {
    max-height: 500px;
    padding: 1rem;
}
.accordion-icon {
    transition: transform 0.3s ease;
}
.accordion-item.active .accordion-icon {
    transform: rotate(45deg);
}
```

```javascript
function toggleAccordion(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');
    
    // 关闭所有项
    document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
    });
    
    // 如果当前项未激活，则激活它
    if (!isActive) {
        item.classList.add('active');
    }
}
```

#### 4.3 标签页切换 (Tabs)

**用途**：对比展示、多视角内容、分类信息

```html
<div class="tabs-container">
    <div class="tabs-header">
        <button class="tab-btn active" onclick="showTab('concept')">概念</button>
        <button class="tab-btn" onclick="showTab('example')">示例</button>
        <button class="tab-btn" onclick="showTab('practice')">练习</button>
    </div>
    <div class="tabs-content">
        <div id="concept" class="tab-panel active">概念解释内容...</div>
        <div id="example" class="tab-panel hidden">示例内容...</div>
        <div id="practice" class="tab-panel hidden">练习内容...</div>
    </div>
</div>
```

```css
.tabs-container {
    width: 100%;
}
.tabs-header {
    display: flex;
    gap: 0.5rem;
    border-bottom: 2px solid var(--border);
    margin-bottom: 1rem;
}
.tab-btn {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: var(--text-muted);
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.3s ease;
}
.tab-btn.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}
.tab-btn:hover {
    color: var(--primary);
}
.tab-panel {
    display: none;
    padding: 1rem;
}
.tab-panel.active {
    display: block;
}
```

```javascript
function showTab(tabId) {
    // 隐藏所有面板
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 移除所有按钮激活状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示目标面板
    document.getElementById(tabId).classList.add('active');
    
    // 激活对应按钮
    event.target.classList.add('active');
}
```

#### 4.4 步骤流程图 (Step Flow)

**用途**：流程说明、操作步骤、时间线

```html
<div class="step-flow">
    <div class="step-line"></div>
    <div class="step-item active" onclick="showStep(1)">
        <div class="step-number">1</div>
        <div class="step-label">输入</div>
    </div>
    <div class="step-item" onclick="showStep(2)">
        <div class="step-number">2</div>
        <div class="step-label">处理</div>
    </div>
    <div class="step-item" onclick="showStep(3)">
        <div class="step-number">3</div>
        <div class="step-label">输出</div>
    </div>
</div>
<div id="stepDetail" class="step-detail">
    <p>点击步骤查看详情</p>
</div>
```

```css
.step-flow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    max-width: 600px;
    margin: 0 auto;
}
.step-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--border);
    z-index: 0;
}
.step-item {
    position: relative;
    z-index: 1;
    text-align: center;
    cursor: pointer;
}
.step-number {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
}
.step-item.active .step-number,
.step-item:hover .step-number {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}
.step-label {
    font-size: 0.9rem;
    color: var(--text-muted);
}
.step-detail {
    margin-top: 2rem;
    padding: 1.5rem;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: var(--shadow-soft);
}
```

```javascript
const stepDetails = {
    1: '输入阶段：接收用户输入的文本数据...',
    2: '处理阶段：通过模型进行计算和推理...',
    3: '输出阶段：生成最终的响应结果...'
};

function showStep(stepNum) {
    // 更新步骤状态
    document.querySelectorAll('.step-item').forEach((item, index) => {
        if (index < stepNum) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // 显示详情
    document.getElementById('stepDetail').innerHTML = `
        <h4>步骤 ${stepNum}</h4>
        <p>${stepDetails[stepNum]}</p>
    `;
}
```

### 5. 增强可视化组件

#### 5.1 打字机效果 (Typewriter)

**用途**：逐字显示文本，模拟对话或代码输入过程

```javascript
class Typewriter {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        this.text = options.text || '';
        this.speed = options.speed || 50;
        this.delay = options.delay || 0;
        this.onComplete = options.onComplete || null;
        this.currentIndex = 0;
        this.isTyping = false;
    }
    
    start() {
        this.isTyping = true;
        this.currentIndex = 0;
        this.element.textContent = '';
        
        setTimeout(() => {
            this.typeNextChar();
        }, this.delay);
    }
    
    typeNextChar() {
        if (!this.isTyping) return;
        
        if (this.currentIndex < this.text.length) {
            this.element.textContent += this.text.charAt(this.currentIndex);
            this.currentIndex++;
            
            const randomSpeed = this.speed + (Math.random() - 0.5) * 30;
            setTimeout(() => this.typeNextChar(), randomSpeed);
        } else {
            this.isTyping = false;
            if (this.onComplete) this.onComplete();
        }
    }
}

// 使用示例
const typewriter = new Typewriter('typewriterText', {
    text: '这是要显示的文本内容...',
    speed: 30,
    delay: 500
});
typewriter.start();
```

#### 5.2 滑动对比器 (Before/After Slider)

**用途**：对比"差提示词"和"好提示词"的效果差异

```html
<div class="before-after-slider" id="baSlider">
    <div class="slider-container">
        <div class="before-panel">
            <div class="panel-label">❌ 差提示词</div>
            <div class="panel-content">
                <p>"帮我写个关于待出租的房间介绍"</p>
            </div>
        </div>
        <div class="after-panel">
            <div class="panel-label">✅ 好提示词</div>
            <div class="panel-content">
                <p>【角色】房产顾问...</p>
            </div>
        </div>
        <div class="slider-handle" id="sliderHandle">
            <div class="handle-button">↔</div>
        </div>
    </div>
</div>
```

```css
.before-after-slider {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
}
.slider-container {
    position: relative;
    height: 400px;
    background: var(--surface);
    border-radius: 16px;
    overflow: hidden;
}
.before-panel, .after-panel {
    position: absolute;
    top: 0;
    height: 100%;
    padding: 1.5rem;
}
.before-panel {
    left: 0;
    width: 100%;
    background: rgba(239, 68, 68, 0.05);
}
.after-panel {
    right: 0;
    width: 50%;
    background: rgba(34, 197, 94, 0.05);
    overflow: hidden;
    border-left: 2px solid var(--primary);
}
.slider-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 40px;
    transform: translateX(-50%);
    cursor: ew-resize;
    display: flex;
    align-items: center;
    justify-content: center;
}
.handle-button {
    width: 40px;
    height: 40px;
    background: var(--primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
}
```

```javascript
function initBeforeAfterSlider(containerId) {
    const container = document.getElementById(containerId);
    const handle = container.querySelector('.slider-handle');
    const afterPanel = container.querySelector('.after-panel');
    let isDragging = false;
    
    function updateSlider(percentage) {
        handle.style.left = `${percentage}%`;
        afterPanel.style.width = `${100 - percentage}%`;
    }
    
    handle.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(40, Math.min(x, rect.width - 40));
        updateSlider((x / rect.width) * 100);
    });
}
```

---

## 参考文档

如需更多详细组件和高级用法，请查阅以下参考文件：

| 需求 | 参考文件 |
|------|---------|
| **更多基础交互组件** | [references/components-basic.md](./references/components-basic.md) |
| **增强可视化组件**（SVG动画、构建器、打字机等） | [references/components-enhanced.md](./references/components-enhanced.md) |
| **幻灯片导航系统**（完整版） | [references/navigation.md](./references/navigation.md) |
| **完整样式设计规范** | [references/styles.md](./references/styles.md) |
| **更多使用示例** | [references/examples.md](./references/examples.md) |

---

## 页面划分规则

| 内容类型 | 页面要求 |
|---------|---------|
| **三级标题** | 每个标题至少一个页面 |
| **举例/示例** | 单独一个页面 |
| **实战练习** | 每个实战单独一个页面 |
| **课程小结** | 可合并为一个页面 |

---

## 最佳实践

### 内容方面
- ❌ 不要自行扩展讲义内容
- ❌ 不要添加个人观点
- ✅ 严格使用讲义原文
- ✅ 保持讲义的逻辑顺序
- ✅ 突出讲义强调的重点

### 交互方面
- ❌ 不要过度设计交互
- ❌ 不要为了交互而交互
- ✅ 交互服务于内容理解
- ✅ 提供清晰的反馈
- ✅ 保持操作简洁直观

### 视觉方面
- ❌ 不要使用过多种颜色
- ❌ 不要让装饰喧宾夺主
- ✅ 保持简洁专业
- ✅ 确保文字清晰可读
- ✅ 视觉元素辅助理解

---

## 文件夹结构

课件存放在 `presentation/` 目录下：

```
presentation/
├── index.html             # 课件主文件（必需）
├── css/
│   └── styles.css         # 自定义样式（可选）
└── js/
    └── app.js             # 交互逻辑（可选）
```

| 文件 | 说明 |
|-----|------|
| `index.html` | 课件主文件，包含所有幻灯片内容 |
| `css/styles.css` | 自定义样式，覆盖默认样式 |
| `js/app.js` | 交互逻辑，处理幻灯片切换和组件交互 |

---

## 初始化新项目

### 自动初始化

使用提供的脚本初始化课件项目：

```bash
node .trae/skills/interactive-courseware-creator/scripts/init-courseware.js <项目路径>
```

### 手动创建

按照上述文件夹结构手动创建目录和文件：

1. 创建课程目录: `第{N}课-{课程名称}/`
2. 创建讲义文件: `讲义.md`
3. 创建课件目录: `presentation/`
4. 创建主文件: `index.html`（可从模板复制）
5. 创建样式目录: `css/` 和 `styles.css`
6. 创建脚本目录: `js/` 和 `app.js`

### 使用模板文件

```bash
cp .trae/skills/interactive-courseware-creator/assets/templates/courseware-template.html ./presentation/index.html
```
