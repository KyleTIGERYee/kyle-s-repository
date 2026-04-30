# 增强型交互组件库

本文档提供增强版的交互组件，专注于将枯燥的文字内容转化为生动的视觉动画和交互体验。

## 目录

1. [SVG动画可视化组件](#1-svg动画可视化组件)
2. [交互式构建器组件](#2-交互式构建器组件)
3. [动态文本效果组件](#3-动态文本效果组件)
4. [对比展示组件](#4-对比展示组件)
5. [概念关系图谱组件](#5-概念关系图谱组件)

---

## 1. SVG动画可视化组件

### 1.1 框架流程动画 (Framework Flow Animation)

**用途**：展示BROKE、CO-STAR等框架的结构和流程

**效果**：节点依次出现，连线动态绘制，形成完整的框架图

**HTML结构**：
```html
<div class="framework-flow" id="brokeFlow">
    <svg viewBox="0 0 800 400" class="framework-svg">
        <!-- 定义渐变和箭头 -->
        <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#d4af37;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#d4af37;stop-opacity:0.1" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#d4af37" />
            </marker>
        </defs>
        
        <!-- 连线 -->
        <path class="flow-line" d="M 100 200 L 200 200" stroke="#d4af37" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
        <path class="flow-line" d="M 280 200 L 380 200" stroke="#d4af37" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
        <path class="flow-line" d="M 460 200 L 560 200" stroke="#d4af37" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
        <path class="flow-line" d="M 640 200 L 740 200" stroke="#d4af37" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
        
        <!-- 节点 -->
        <g class="flow-node" data-node="B">
            <circle cx="60" cy="200" r="50" fill="url(#nodeGradient)" stroke="#d4af37" stroke-width="2"/>
            <text x="60" y="195" text-anchor="middle" fill="#d4af37" font-size="24" font-weight="bold">B</text>
            <text x="60" y="215" text-anchor="middle" fill="#fff" font-size="14">Background</text>
        </g>
        
        <g class="flow-node" data-node="R">
            <circle cx="240" cy="200" r="50" fill="url(#nodeGradient)" stroke="#d4af37" stroke-width="2"/>
            <text x="240" y="195" text-anchor="middle" fill="#d4af37" font-size="24" font-weight="bold">R</text>
            <text x="240" y="215" text-anchor="middle" fill="#fff" font-size="14">Role</text>
        </g>
        
        <g class="flow-node" data-node="O">
            <circle cx="420" cy="200" r="50" fill="url(#nodeGradient)" stroke="#d4af37" stroke-width="2"/>
            <text x="420" y="195" text-anchor="middle" fill="#d4af37" font-size="24" font-weight="bold">O</text>
            <text x="420" y="215" text-anchor="middle" fill="#fff" font-size="14">Objectives</text>
        </g>
        
        <g class="flow-node" data-node="K">
            <circle cx="600" cy="200" r="50" fill="url(#nodeGradient)" stroke="#d4af37" stroke-width="2"/>
            <text x="600" y="195" text-anchor="middle" fill="#d4af37" font-size="24" font-weight="bold">K</text>
            <text x="600" y="215" text-anchor="middle" fill="#fff" font-size="14">Key Result</text>
        </g>
        
        <g class="flow-node" data-node="E">
            <circle cx="780" cy="200" r="50" fill="url(#nodeGradient)" stroke="#d4af37" stroke-width="2"/>
            <text x="780" y="195" text-anchor="middle" fill="#d4af37" font-size="24" font-weight="bold">E</text>
            <text x="780" y="215" text-anchor="middle" fill="#fff" font-size="14">Evolve</text>
        </g>
    </svg>
    
    <!-- 详情面板 -->
    <div class="framework-detail" id="frameworkDetail">
        <p>点击节点查看详情</p>
    </div>
</div>
```

**CSS样式**：
```css
.framework-flow {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
}

.framework-svg {
    width: 100%;
    height: auto;
}

.flow-node {
    cursor: pointer;
    opacity: 0;
    transform-origin: center;
    transition: all 0.3s ease;
}

.flow-node:hover circle {
    stroke-width: 3;
    filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
}

.flow-line {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
}

.framework-detail {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    min-height: 100px;
}
```

**JavaScript**：
```javascript
// 框架节点详情数据
const frameworkData = {
    B: {
        title: 'Background - 背景',
        description: '阐述任务背景，为AI提供充足信息',
        example: '示例：我们是一家深圳的长租公寓品牌，主要服务年轻白领群体'
    },
    R: {
        title: 'Role - 角色',
        description: '设定AI扮演的角色',
        example: '示例：你是一位资深的房产销售顾问'
    },
    O: {
        title: 'Objectives - 目标',
        description: '明确任务目标',
        example: '示例：为新客户推荐合适的房源'
    },
    K: {
        title: 'Key Result - 关键结果',
        description: '定义成功的标准和输出格式',
        example: '示例：推荐3套房源，每套包含价格、面积、交通信息'
    },
    E: {
        title: 'Evolve - 演变',
        description: '根据反馈进行优化',
        example: '示例：如果客户对价格敏感，优先推荐性价比高的房源'
    }
};

// 动画初始化
function initFrameworkAnimation(containerId) {
    const container = document.getElementById(containerId);
    const nodes = container.querySelectorAll('.flow-node');
    const lines = container.querySelectorAll('.flow-line');
    
    // 节点依次出现动画
    nodes.forEach((node, index) => {
        gsap.to(node, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: index * 0.3,
            ease: 'back.out(1.7)',
            onComplete: () => {
                // 节点出现后，绘制连线
                if (index < lines.length) {
                    gsap.to(lines[index], {
                        strokeDashoffset: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            }
        });
        
        // 添加点击事件
        node.addEventListener('click', () => {
            const nodeKey = node.getAttribute('data-node');
            showFrameworkDetail(nodeKey);
        });
    });
}

// 显示节点详情
function showFrameworkDetail(nodeKey) {
    const detail = document.getElementById('frameworkDetail');
    const data = frameworkData[nodeKey];
    
    gsap.to(detail, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        onComplete: () => {
            detail.innerHTML = `
                <h3 class="text-subtitle font-bold text-accent mb-2">${data.title}</h3>
                <p class="text-body mb-2">${data.description}</p>
                <p class="text-label text-text-secondary">${data.example}</p>
            `;
            gsap.to(detail, {
                opacity: 1,
                y: 0,
                duration: 0.3
            });
        }
    });
}
```

---

### 1.2 概念关系图谱 (Concept Map)

**用途**：展示概念之间的关系，如提示词工程的核心概念关联

**效果**：节点可拖拽，点击展开详情，支持缩放

**HTML结构**：
```html
<div class="concept-map" id="conceptMap">
    <svg viewBox="0 0 1000 600" class="concept-svg">
        <defs>
            <radialGradient id="centerNode" cx="50%" cy="50%">
                <stop offset="0%" style="stop-color:#d4af37;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:#d4af37;stop-opacity:0.1" />
            </radialGradient>
        </defs>
        
        <!-- 连接线 -->
        <g class="concept-links">
            <line class="concept-line" x1="500" y1="300" x2="200" y2="150" stroke="#d4af37" stroke-width="2" opacity="0.3"/>
            <line class="concept-line" x1="500" y1="300" x2="800" y2="150" stroke="#d4af37" stroke-width="2" opacity="0.3"/>
            <line class="concept-line" x1="500" y1="300" x2="200" y2="450" stroke="#d4af37" stroke-width="2" opacity="0.3"/>
            <line class="concept-line" x1="500" y1="300" x2="800" y2="450" stroke="#d4af37" stroke-width="2" opacity="0.3"/>
            <line class="concept-line" x1="500" y1="300" x2="500" y2="100" stroke="#d4af37" stroke-width="2" opacity="0.3"/>
        </g>
        
        <!-- 中心节点 -->
        <g class="concept-node center" data-concept="center">
            <circle cx="500" cy="300" r="80" fill="url(#centerNode)" stroke="#d4af37" stroke-width="3"/>
            <text x="500" y="295" text-anchor="middle" fill="#fff" font-size="18" font-weight="bold">提示词工程</text>
            <text x="500" y="315" text-anchor="middle" fill="#d4af37" font-size="12">Prompt Engineering</text>
        </g>
        
        <!-- 子节点 -->
        <g class="concept-node" data-concept="framework" style="transform-origin: 200px 150px;">
            <circle cx="200" cy="150" r="60" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="2"/>
            <text x="200" y="145" text-anchor="middle" fill="#fff" font-size="14">框架</text>
            <text x="200" y="160" text-anchor="middle" fill="#d4af37" font-size="14">BROKE/CO-STAR</text>
        </g>
        
        <g class="concept-node" data-concept="technique" style="transform-origin: 800px 150px;">
            <circle cx="800" cy="150" r="60" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="2"/>
            <text x="800" y="145" text-anchor="middle" fill="#fff" font-size="14">技巧</text>
            <text x="800" y="160" text-anchor="middle" fill="#d4af37" font-size="14">Few-Shot/分隔符</text>
        </g>
        
        <g class="concept-node" data-concept="format" style="transform-origin: 200px 450px;">
            <circle cx="200" cy="450" r="60" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="2"/>
            <text x="200" y="445" text-anchor="middle" fill="#fff" font-size="14">格式</text>
            <text x="200" y="460" text-anchor="middle" fill="#d4af37" font-size="14">Markdown</text>
        </g>
        
        <g class="concept-node" data-concept="platform" style="transform-origin: 800px 450px;">
            <circle cx="800" cy="450" r="60" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="2"/>
            <text x="800" y="445" text-anchor="middle" fill="#fff" font-size="14">平台</text>
            <text x="800" y="460" text-anchor="middle" fill="#d4af37" font-size="14">Coze优化</text>
        </g>
        
        <g class="concept-node" data-concept="practice" style="transform-origin: 500px 100px;">
            <circle cx="500" cy="100" r="60" fill="rgba(212,175,55,0.1)" stroke="#d4af37" stroke-width="2"/>
            <text x="500" y="95" text-anchor="middle" fill="#fff" font-size="14">实战</text>
            <text x="500" y="110" text-anchor="middle" fill="#d4af37" font-size="14">金牌销售</text>
        </g>
    </svg>
</div>
```

**JavaScript**：
```javascript
function initConceptMap(containerId) {
    const container = document.getElementById(containerId);
    const nodes = container.querySelectorAll('.concept-node');
    const lines = container.querySelectorAll('.concept-line');
    
    // 初始动画：从中心向外扩散
    gsap.from('.concept-node.center', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
    });
    
    gsap.from('.concept-node:not(.center)', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.4,
        ease: 'back.out(1.7)'
    });
    
    gsap.from('.concept-line', {
        strokeDasharray: 500,
        strokeDashoffset: 500,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.6,
        ease: 'power2.out'
    });
    
    // 节点悬停效果
    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            gsap.to(node, {
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
            
            // 高亮相关连线
            const concept = node.getAttribute('data-concept');
            highlightRelatedLines(concept);
        });
        
        node.addEventListener('mouseleave', () => {
            gsap.to(node, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
            
            resetLines();
        });
    });
}

function highlightRelatedLines(concept) {
    const lines = document.querySelectorAll('.concept-line');
    gsap.to(lines, {
        opacity: 0.1,
        duration: 0.3
    });
    
    if (concept === 'center') {
        gsap.to(lines, {
            opacity: 1,
            strokeWidth: 3,
            duration: 0.3
        });
    }
}

function resetLines() {
    const lines = document.querySelectorAll('.concept-line');
    gsap.to(lines, {
        opacity: 0.3,
        strokeWidth: 2,
        duration: 0.3
    });
}
```

---

## 2. 交互式构建器组件

### 2.1 Prompt构建器 (Prompt Builder)

**用途**：让用户通过拖拽或选择的方式构建提示词，实时预览效果

**效果**：选择不同组件，实时组装成完整提示词

**HTML结构**：
```html
<div class="prompt-builder">
    <div class="builder-workspace">
        <h3 class="text-subtitle mb-4">构建你的提示词</h3>
        
        <!-- 组件选择区 -->
        <div class="component-palette">
            <div class="palette-section">
                <h4 class="text-label text-accent mb-2">BROKE组件</h4>
                <div class="component-list">
                    <button class="component-btn" data-component="background" onclick="addComponent('background')">
                        <span class="component-icon">📋</span>
                        <span>Background</span>
                    </button>
                    <button class="component-btn" data-component="role" onclick="addComponent('role')">
                        <span class="component-icon">👤</span>
                        <span>Role</span>
                    </button>
                    <button class="component-btn" data-component="objectives" onclick="addComponent('objectives')">
                        <span class="component-icon">🎯</span>
                        <span>Objectives</span>
                    </button>
                    <button class="component-btn" data-component="keyresult" onclick="addComponent('keyresult')">
                        <span class="component-icon">✅</span>
                        <span>Key Result</span>
                    </button>
                    <button class="component-btn" data-component="evolve" onclick="addComponent('evolve')">
                        <span class="component-icon">🔄</span>
                        <span>Evolve</span>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 构建区域 -->
        <div class="build-area" id="buildArea">
            <p class="placeholder-text">点击上方组件添加到此处</p>
        </div>
    </div>
    
    <!-- 预览区域 -->
    <div class="preview-panel">
        <h3 class="text-subtitle mb-4">生成的提示词</h3>
        <div class="preview-content" id="previewContent">
            <pre class="preview-code">// 提示词将在这里显示</pre>
        </div>
        <button class="copy-btn" onclick="copyPrompt()">
            <span>📋 复制提示词</span>
        </button>
    </div>
</div>
```

**CSS样式**：
```css
.prompt-builder {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
}

.builder-workspace {
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
}

.component-palette {
    margin-bottom: 1.5rem;
}

.component-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.component-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
}

.component-btn:hover {
    background: rgba(212, 175, 55, 0.2);
    transform: translateY(-2px);
}

.build-area {
    min-height: 200px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
}

.build-item {
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    cursor: move;
    transition: all 0.3s ease;
}

.build-item:hover {
    border-color: #d4af37;
}

.build-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.build-item-title {
    color: #d4af37;
    font-weight: 600;
}

.build-item-remove {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 1.2rem;
}

.build-item textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.5rem;
    color: #fff;
    resize: vertical;
    min-height: 60px;
}

.preview-panel {
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
}

.preview-content {
    flex: 1;
    background: #0f0f10;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1rem;
    overflow: auto;
    margin-bottom: 1rem;
}

.preview-code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    color: #fff;
    white-space: pre-wrap;
}

.copy-btn {
    padding: 0.75rem 1.5rem;
    background: #d4af37;
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.copy-btn:hover {
    background: #f5d76e;
    transform: translateY(-2px);
}
```

**JavaScript**：
```javascript
// 组件模板
const componentTemplates = {
    background: {
        title: '【Background/背景】',
        placeholder: '描述任务背景，如：我们是一家...',
        defaultValue: ''
    },
    role: {
        title: '【Role/角色】',
        placeholder: '设定AI角色，如：你是一位...',
        defaultValue: ''
    },
    objectives: {
        title: '【Objectives/目标】',
        placeholder: '明确任务目标，如：请帮我...',
        defaultValue: ''
    },
    keyresult: {
        title: '【Key Result/关键结果】',
        placeholder: '定义成功标准，如：输出格式为...',
        defaultValue: ''
    },
    evolve: {
        title: '【Evolve/演变】',
        placeholder: '优化策略，如：如果...则...',
        defaultValue: ''
    }
};

let buildItems = [];

function addComponent(type) {
    const template = componentTemplates[type];
    const id = Date.now();
    
    const item = {
        id: id,
        type: type,
        title: template.title,
        content: ''
    };
    
    buildItems.push(item);
    renderBuildArea();
    updatePreview();
}

function renderBuildArea() {
    const area = document.getElementById('buildArea');
    
    if (buildItems.length === 0) {
        area.innerHTML = '<p class="placeholder-text">点击上方组件添加到此处</p>';
        return;
    }
    
    area.innerHTML = buildItems.map(item => `
        <div class="build-item" data-id="${item.id}">
            <div class="build-item-header">
                <span class="build-item-title">${item.title}</span>
                <button class="build-item-remove" onclick="removeComponent(${item.id})">×</button>
            </div>
            <textarea 
                placeholder="${componentTemplates[item.type].placeholder}"
                oninput="updateComponentContent(${item.id}, this.value)"
            >${item.content}</textarea>
        </div>
    `).join('');
    
    // 添加动画
    gsap.from('.build-item:last-child', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.out'
    });
}

function removeComponent(id) {
    buildItems = buildItems.filter(item => item.id !== id);
    renderBuildArea();
    updatePreview();
}

function updateComponentContent(id, content) {
    const item = buildItems.find(i => i.id === id);
    if (item) {
        item.content = content;
        updatePreview();
    }
}

function updatePreview() {
    const preview = document.getElementById('previewContent');
    
    if (buildItems.length === 0) {
        preview.innerHTML = '<pre class="preview-code">// 提示词将在这里显示</pre>';
        return;
    }
    
    const promptText = buildItems.map(item => {
        return `${item.title}\n${item.content || '// 在此输入内容...'}`;
    }).join('\n\n');
    
    preview.innerHTML = `<pre class="preview-code">${escapeHtml(promptText)}</pre>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyPrompt() {
    const promptText = buildItems.map(item => {
        return `${item.title}\n${item.content}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(promptText).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>✅ 已复制</span>';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}
```

---

## 3. 动态文本效果组件

### 3.1 打字机效果 (Typewriter Effect)

**用途**：逐字显示文本，模拟对话或代码输入过程

**效果**：文字逐字出现，配合光标闪烁

**HTML结构**：
```html
<div class="typewriter-container">
    <div class="typewriter-label">
        <span class="text-label text-accent">AI 响应</span>
    </div>
    <div class="typewriter-content" id="typewriterText"></div>
    <span class="typewriter-cursor">|</span>
</div>
```

**CSS样式**：
```css
.typewriter-container {
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    min-height: 200px;
    position: relative;
}

.typewriter-label {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.typewriter-content {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    line-height: 1.8;
    color: #fff;
    white-space: pre-wrap;
}

.typewriter-cursor {
    display: inline-block;
    color: #d4af37;
    font-weight: bold;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}
```

**JavaScript**：
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
            
            // 随机速度变化，模拟真实打字
            const randomSpeed = this.speed + (Math.random() - 0.5) * 30;
            
            setTimeout(() => {
                this.typeNextChar();
            }, randomSpeed);
        } else {
            this.isTyping = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    stop() {
        this.isTyping = false;
    }
    
    reset() {
        this.stop();
        this.currentIndex = 0;
        this.element.textContent = '';
    }
}

// 使用示例
function initTypewriterDemo() {
    const typewriter = new Typewriter('typewriterText', {
        text: `您好！很高兴为您服务😊

根据您的需求，我为您推荐以下3套房源：

🏠 西乡永丰店·阳光单间
- 价格：2800元/月
- 面积：22㎡
- 卖点：近地铁、采光好、精装修

您看哪套比较感兴趣？`,
        speed: 30,
        delay: 500
    });
    
    typewriter.start();
}
```

---

### 3.2 高亮扫描效果 (Highlight Scan)

**用途**：逐行高亮显示代码或文本，引导阅读重点

**效果**：当前行高亮，其他行变暗

**HTML结构**：
```html
<div class="highlight-scan">
    <div class="scan-line"></div>
    <div class="scan-content">
        <div class="scan-item" data-line="1">
            <span class="line-number">1</span>
            <span class="line-content">【Background/背景】</span>
        </div>
        <div class="scan-item" data-line="2">
            <span class="line-number">2</span>
            <span class="line-content">安居乐寓是深圳领先的长租公寓品牌...</span>
        </div>
        <div class="scan-item" data-line="3">
            <span class="line-number">3</span>
            <span class="line-content"></span>
        </div>
        <div class="scan-item" data-line="4">
            <span class="line-number">4</span>
            <span class="line-content">【Role/角色】</span>
        </div>
        <div class="scan-item" data-line="5">
            <span class="line-number">5</span>
            <span class="line-content">你是一位经验丰富的公寓管家...</span>
        </div>
    </div>
</div>
```

**CSS样式**：
```css
.highlight-scan {
    position: relative;
    background: rgba(15, 15, 16, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1rem 0;
    overflow: hidden;
}

.scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2.5rem;
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
    border-left: 3px solid #d4af37;
    transition: top 0.3s ease;
    pointer-events: none;
}

.scan-content {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    line-height: 2.5rem;
}

.scan-item {
    display: flex;
    align-items: center;
    padding: 0 1rem;
    transition: all 0.3s ease;
    opacity: 0.4;
}

.scan-item.active {
    opacity: 1;
}

.line-number {
    width: 2rem;
    color: #71717a;
    text-align: right;
    margin-right: 1rem;
    user-select: none;
}

.line-content {
    color: #fff;
}

.scan-item.active .line-number {
    color: #d4af37;
}
```

**JavaScript**：
```javascript
function initHighlightScan(containerId, options = {}) {
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.scan-item');
    const scanLine = container.querySelector('.scan-line');
    
    let currentIndex = 0;
    const interval = options.interval || 2000;
    const autoPlay = options.autoPlay !== false;
    
    function highlightLine(index) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        
        // 移动扫描线
        const itemHeight = items[0].offsetHeight;
        scanLine.style.top = `${index * itemHeight + 16}px`;
        
        currentIndex = index;
    }
    
    // 初始高亮
    highlightLine(0);
    
    // 自动播放
    if (autoPlay) {
        setInterval(() => {
            const nextIndex = (currentIndex + 1) % items.length;
            highlightLine(nextIndex);
        }, interval);
    }
    
    // 点击切换
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            highlightLine(index);
        });
    });
}
```

---

## 4. 对比展示组件

### 4.1 滑动对比器 (Before/After Slider)

**用途**：对比"差提示词"和"好提示词"的效果差异

**效果**：拖动滑块查看对比

**HTML结构**：
```html
<div class="before-after-slider">
    <div class="slider-container">
        <div class="before-panel">
            <div class="panel-label">❌ 差提示词</div>
            <div class="panel-content">
                <p>"帮我写个关于待出租的房间介绍"</p>
                <div class="panel-result">
                    <strong>AI输出：</strong>
                    <p class="result-text">这是一个房间，有床和桌子，可以住人。租金面议。</p>
                </div>
            </div>
        </div>
        
        <div class="after-panel">
            <div class="panel-label">✅ 好提示词</div>
            <div class="panel-content">
                <p>【角色】房产顾问<br>
                【任务】为刚毕业的大学生写租房介绍<br>
                【要求】语气亲切，突出性价比，200字以内</p>
                <div class="panel-result">
                    <strong>AI输出：</strong>
                    <p class="result-text">🎓 毕业生专属福利！温馨小窝等你来~<br><br>
                    刚踏入职场的你，值得一个舒适的家...</p>
                </div>
            </div>
        </div>
        
        <div class="slider-handle" id="sliderHandle">
            <div class="handle-line"></div>
            <div class="handle-button">↔</div>
            <div class="handle-line"></div>
        </div>
    </div>
</div>
```

**CSS样式**：
```css
.before-after-slider {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
}

.slider-container {
    position: relative;
    height: 400px;
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
}

.before-panel,
.after-panel {
    position: absolute;
    top: 0;
    height: 100%;
    padding: 1.5rem;
}

.before-panel {
    left: 0;
    width: 100%;
    background: rgba(239, 68, 68, 0.05);
    border-right: 2px solid rgba(212, 175, 55, 0.5);
}

.after-panel {
    right: 0;
    width: 50%;
    background: rgba(24, 24, 27, 1);
    overflow: hidden;
    border-left: 2px solid #d4af37;
    z-index: 5;
}

.panel-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    margin-bottom: 1rem;
}

.before-panel .panel-label {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.after-panel .panel-label {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
}

.panel-content {
    font-size: 0.95rem;
    line-height: 1.6;
}

.panel-result {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
}

.result-text {
    margin-top: 0.5rem;
    color: #a1a1aa;
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
    flex-direction: column;
    align-items: center;
    z-index: 10;
}

.handle-line {
    flex: 1;
    width: 2px;
    background: #d4af37;
}

.handle-button {
    width: 40px;
    height: 40px;
    background: #d4af37;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: bold;
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
}
```

**JavaScript**：
```javascript
function initBeforeAfterSlider(containerId) {
    const container = document.getElementById(containerId);
    const handle = container.querySelector('.slider-handle');
    const afterPanel = container.querySelector('.after-panel');
    
    let isDragging = false;
    
    function updateSlider(percentage) {
        handle.style.left = `${percentage}%`;
        afterPanel.style.width = `${100 - percentage}%`;
        
        // 当滑动到最右端（percentage > 95%）时，将上层（after-panel）置为透明
        if (afterPanel) {
            if (percentage > 95) {
                afterPanel.style.opacity = '0';
                afterPanel.style.transition = 'opacity 0.3s ease';
            } else {
                afterPanel.style.opacity = '1';
            }
        }
    }
    
    handle.addEventListener('mousedown', () => {
        isDragging = true;
        container.style.cursor = 'ew-resize';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'default';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left;
        
        // 限制范围
        x = Math.max(40, Math.min(x, rect.width - 40));
        
        const percentage = (x / rect.width) * 100;
        updateSlider(percentage);
    });
    
    // 触摸支持
    handle.addEventListener('touchstart', () => {
        isDragging = true;
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const rect = container.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        
        x = Math.max(40, Math.min(x, rect.width - 40));
        
        const percentage = (x / rect.width) * 100;
        updateSlider(percentage);
    });
}
```

---

## 5. 概念关系图谱组件

### 5.1 思维导图 (Mind Map)

**用途**：展示概念之间的层级关系

**效果**：可展开/收起分支，点击节点查看详情

**HTML结构**：
```html
<div class="mind-map" id="mindMap">
    <div class="mind-map-container">
        <div class="mind-node root" data-node="prompt-engineering">
            <div class="node-content">
                <span class="node-title">提示词工程</span>
            </div>
        </div>
        
        <div class="mind-branch" data-parent="prompt-engineering">
            <div class="mind-node" data-node="framework">
                <div class="node-content">
                    <span class="node-title">框架</span>
                </div>
                <div class="node-children">
                    <div class="mind-node leaf" data-node="broke">
                        <span class="node-title">BROKE</span>
                    </div>
                    <div class="mind-node leaf" data-node="costar">
                        <span class="node-title">CO-STAR</span>
                    </div>
                </div>
            </div>
            
            <div class="mind-node" data-node="techniques">
                <div class="node-content">
                    <span class="node-title">技巧</span>
                </div>
                <div class="node-children">
                    <div class="mind-node leaf" data-node="fewshot">
                        <span class="node-title">Few-Shot</span>
                    </div>
                    <div class="mind-node leaf" data-node="delimiter">
                        <span class="node-title">分隔符</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

**CSS样式**：
```css
.mind-map {
    width: 100%;
    overflow: auto;
    padding: 2rem;
}

.mind-map-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    min-width: 600px;
}

.mind-node {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.mind-node.root .node-content {
    background: rgba(212, 175, 55, 0.3);
    border: 2px solid #d4af37;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: bold;
}

.node-content {
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.5);
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.node-content:hover {
    background: rgba(212, 175, 55, 0.2);
    transform: scale(1.05);
}

.node-title {
    color: #fff;
    font-weight: 600;
}

.mind-branch {
    display: flex;
    gap: 3rem;
    position: relative;
}

.mind-branch::before {
    content: '';
    position: absolute;
    top: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 1rem;
    background: #d4af37;
}

.node-children {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid rgba(212, 175, 55, 0.3);
    position: relative;
}

.node-children::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 1rem;
    background: #d4af37;
}

.mind-node.leaf .node-title {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
}
```

---

## 组件选择指南（增强版）

| 内容类型 | 推荐组件 | 原因 |
|---------|---------|------|
| **框架结构** | 框架流程动画、概念关系图谱 | 动态展示框架组成和关系 |
| **概念解释** | 思维导图、卡片翻转 | 层级关系清晰，逐步揭示 |
| **对比展示** | 滑动对比器、标签页 | 直观对比差异 |
| **代码/文本** | 打字机效果、高亮扫描 | 引导阅读，突出重点 |
| **实践操作** | Prompt构建器 | 动手实践，即时反馈 |
| **流程说明** | 步骤流程图、时间轴 | 展示先后顺序 |
| **数据展示** | 进度条、对比条 | 直观可视化 |

---

## 最佳实践（增强版）

1. **视觉优先**：能用动画展示的不用文字描述
2. **渐进揭示**：复杂内容分步骤动画展示
3. **交互反馈**：每个操作都有视觉反馈
4. **避免过度**：每页1-2个重点动画即可
5. **性能优化**：使用GSAP等高性能动画库
6. **响应式设计**：确保在各种屏幕尺寸下正常显示
