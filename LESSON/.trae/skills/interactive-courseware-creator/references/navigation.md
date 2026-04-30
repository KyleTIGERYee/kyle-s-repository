# 幻灯片导航系统

本文档详细介绍课件中的幻灯片导航系统，包括页面切换、键盘控制、进度显示等功能。

## 目录

1. [基础结构](#1-基础结构)
2. [页面切换](#2-页面切换)
3. [键盘控制](#3-键盘控制)
4. [触摸支持](#4-触摸支持)
5. [进度显示](#5-进度显示)
6. [动画效果](#6-动画效果)

---

## 1. 基础结构

### HTML结构

```html
<!-- 幻灯片容器 -->
<div id="slides-container" class="relative w-full h-full">
    <!-- 单个幻灯片 -->
    <section class="slide active" data-index="0">
        <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
            <!-- 页面内容 -->
        </div>
    </section>
    <section class="slide" data-index="1">
        <!-- 第二页内容 -->
    </section>
    <!-- 更多幻灯片... -->
</div>

<!-- 导航控制 -->
<div class="ui-element fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
    <button id="prevBtn" onclick="prevSlide()">上一页</button>
    <div class="slide-counter">
        <span id="currentSlide">1</span> / <span id="totalSlides">10</span>
    </div>
    <button id="nextBtn" onclick="nextSlide()">下一页</button>
</div>

<!-- 页面指示点 -->
<div class="ui-element fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
    <!-- 动态生成 -->
</div>

<!-- 进度条 -->
<div class="ui-element fixed bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
    <div id="progressBar" class="h-full bg-accent transition-all duration-500"></div>
</div>
```

### CSS样式

```css
/* 幻灯片基础样式 */
.slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.6s ease, visibility 0.6s ease;
}

.slide.active {
    opacity: 1;
    visibility: visible;
}

/* 内容容器 */
.slide-content {
    width: 95% !important;
    max-width: 1600px !important;
}

/* 导航按钮 */
.nav-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(30, 30, 45, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-btn:hover {
    border-color: rgba(212, 175, 55, 0.5);
}

.nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

/* 页面指示点 */
.slide-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
}

.slide-dot.active {
    background: #d4af37;
    transform: scale(1.25);
}

/* 进度条 */
#progressBar {
    background: linear-gradient(90deg, #d4af37, #f5d76e);
}
```

---

## 2. 页面切换

### 核心JavaScript

```javascript
// 全局状态
let currentSlide = 0;
const totalSlides = document.querySelectorAll('.slide').length;

// 更新幻灯片显示
function updateSlideDisplay() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dot');
    
    // 更新幻灯片状态
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
    
    // 更新指示点
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
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
    
    // 触发动画
    animateSlideContent();
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

// 跳转到指定页
function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
        currentSlide = index;
        updateSlideDisplay();
    }
}

// 初始化指示点
function initDots() {
    const dotsContainer = document.querySelector('.ui-element.fixed.right-8');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'slide-dot';
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
}
```

---

## 3. 键盘控制

### 支持的快捷键

| 按键 | 功能 |
|------|------|
| `→` / `↓` / `空格` / `PageDown` | 下一页 |
| `←` / `↑` / `PageUp` | 上一页 |
| `Home` | 跳转到第一页 |
| `End` | 跳转到最后一页 |
| `F` | 切换全屏 |

### 实现代码

```javascript
document.addEventListener('keydown', (e) => {
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
            goToSlide(0);
            break;
        case 'End':
            e.preventDefault();
            goToSlide(totalSlides - 1);
            break;
        case 'f':
        case 'F':
            e.preventDefault();
            toggleFullscreen();
            break;
    }
});

// 防止空格键滚动页面
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});
```

---

## 4. 触摸支持

### 滑动切换

```javascript
let touchStartX = 0;
let touchStartY = 0;

// 记录触摸开始位置
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

// 触摸结束，判断滑动方向
document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 判断水平滑动且距离超过50px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
            // 向左滑动，下一页
            nextSlide();
        } else {
            // 向右滑动，上一页
            prevSlide();
        }
    }
}, { passive: true });
```

---

## 5. 进度显示

### 页码计数器

```html
<div class="slide-counter">
    <span id="currentSlide" class="text-accent font-bold">1</span>
    <span class="text-muted">/</span>
    <span id="totalSlides" class="text-muted">10</span>
</div>
```

### 进度条

```html
<div class="progress-bar-container">
    <div id="progressBar" class="progress-bar"></div>
</div>
```

```css
.progress-bar-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 50;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #d4af37, #f5d76e);
    transition: width 0.5s ease;
}
```

---

## 6. 动画效果

### 页面切换动画

```css
.slide {
    transition: opacity 0.6s ease, visibility 0.6s ease;
}

.slide.active {
    animation: slideIn 0.6s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### 内容入场动画（使用GSAP）

```javascript
function animateSlideContent() {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;
    
    const elements = activeSlide.querySelectorAll('.interactive-box, .text-title, .text-subtitle, .text-body');
    
    gsap.fromTo(elements, 
        { 
            opacity: 0, 
            y: 30 
        },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            stagger: 0.1,
            ease: 'power3.out'
        }
    );
}
```

### 指示点动画

```css
.slide-dot {
    transition: all 0.3s ease;
}

.slide-dot:hover {
    transform: scale(1.2);
    background: rgba(212, 175, 55, 0.5);
}

.slide-dot.active {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4);
    }
    50% {
        box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
    }
}
```

---

## 7. 全屏功能

```javascript
let isFullscreen = false;

function toggleFullscreen() {
    const presentation = document.getElementById('presentation');
    
    if (!isFullscreen) {
        if (presentation.requestFullscreen) {
            presentation.requestFullscreen();
        } else if (presentation.webkitRequestFullscreen) {
            presentation.webkitRequestFullscreen();
        }
        isFullscreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        isFullscreen = false;
    }
}
```

---

## 8. 初始化

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面指示点
    initDots();
    
    // 显示第一页
    updateSlideDisplay();
    
    // 初始化粒子背景（如果有）
    initParticleBackground();
});
```

---

## 最佳实践

1. **平滑过渡**：页面切换动画时长控制在500-800ms
2. **即时反馈**：按钮点击后立即有视觉反馈
3. **防止误触**：触摸滑动需要超过50px才触发
4. **键盘优先**：确保所有功能都可以通过键盘操作
5. **状态同步**：页码、进度条、指示点状态保持一致
