# 通用交互组件库

本文档详细介绍课件制作中可用的通用交互组件，这些组件适用于各类课程主题。

## 目录

1. [内容展示类](#1-内容展示类)
2. [数据可视化类](#2-数据可视化类)
3. [交互输入类](#3-交互输入类)
4. [知识检测类](#4-知识检测类)

---

## 1. 内容展示类

### 1.1 卡片翻转 (Flip Card)

**用途**：问答、概念解释、前后对比

**效果**：点击卡片翻转，显示背面内容

**HTML结构**：
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

**CSS样式**：
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
    background: rgba(212, 175, 55, 0.2);
    border: 2px solid rgba(212, 175, 55, 0.5);
}
.flip-card-back {
    background: rgba(30, 30, 45, 0.9);
    border: 2px solid rgba(212, 175, 55, 0.3);
    transform: rotateY(180deg);
}
```

**JavaScript**：
```javascript
function flipCard(card) {
    card.classList.toggle('flipped');
}
```

---

### 1.2 手风琴折叠 (Accordion)

**用途**：FAQ、分步骤说明、详细解释

**效果**：点击标题展开/收起内容

**HTML结构**：
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
    <div class="accordion-item">
        <button class="accordion-header" onclick="toggleAccordion(this)">
            <span>步骤2：模型训练</span>
            <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
            <p>详细说明模型训练的过程...</p>
        </div>
    </div>
</div>
```

**JavaScript**：
```javascript
function toggleAccordion(button) {
    const item = button.parentElement;
    const content = button.nextElementSibling;
    const icon = button.querySelector('.accordion-icon');
    
    // 关闭其他项
    document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.accordion-content').style.maxHeight = null;
            otherItem.querySelector('.accordion-icon').textContent = '+';
        }
    });
    
    // 切换当前项
    item.classList.toggle('active');
    if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + "px";
        icon.textContent = '-';
    } else {
        content.style.maxHeight = null;
        icon.textContent = '+';
    }
}
```

---

### 1.3 标签页切换 (Tabs)

**用途**：对比展示、多视角内容、分类信息

**效果**：点击标签切换内容区域

**HTML结构**：
```html
<div class="tabs-container">
    <div class="tabs-header">
        <button class="tab-btn active" onclick="showTab('concept')">概念</button>
        <button class="tab-btn" onclick="showTab('example')">示例</button>
        <button class="tab-btn" onclick="showTab('practice')">练习</button>
    </div>
    <div class="tabs-content">
        <div id="concept" class="tab-panel active">
            <p>概念解释内容...</p>
        </div>
        <div id="example" class="tab-panel hidden">
            <p>示例内容...</p>
        </div>
        <div id="practice" class="tab-panel hidden">
            <p>练习内容...</p>
        </div>
    </div>
</div>
```

**JavaScript**：
```javascript
function showTab(tabId) {
    // 隐藏所有面板
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
        panel.classList.remove('active');
    });
    
    // 移除所有按钮激活状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示目标面板
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById(tabId).classList.add('active');
    
    // 激活对应按钮
    event.target.classList.add('active');
}
```

---

### 1.4 步骤流程图 (Step Flow)

**用途**：流程说明、操作步骤、时间线

**效果**：点击步骤查看详情，可配合进度展示

**HTML结构**：
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

**JavaScript**：
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

---

## 2. 数据可视化类

### 2.1 进度条 (Progress Bar)

**用途**：完成度、占比、概率展示

**效果**：动态填充的进度条

**HTML结构**：
```html
<div class="progress-item">
    <div class="progress-label">
        <span>选项A</span>
        <span>75%</span>
    </div>
    <div class="progress-container">
        <div class="progress-fill" style="width: 75%"></div>
    </div>
</div>
```

**CSS样式**：
```css
.progress-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    height: 24px;
}
.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #d4af37, #f5d76e);
    border-radius: 8px;
    transition: width 0.8s ease;
}
```

**动画效果**：
```javascript
// 页面加载时触发
window.addEventListener('load', () => {
    document.querySelectorAll('.progress-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
});
```

---

### 2.2 对比条 (Comparison Bar)

**用途**：方案对比、前后对比、A/B测试

**效果**：左右分栏的对比展示

**HTML结构**：
```html
<div class="comparison-bar">
    <div class="comparison-track">
        <div class="bar-left" style="width: 40%">
            <span>传统方法</span>
            <span>40%</span>
        </div>
        <div class="bar-right" style="width: 60%">
            <span>AI方法</span>
            <span>60%</span>
        </div>
    </div>
</div>
```

---

### 2.3 时间轴 (Timeline)

**用途**：发展历程、历史事件、项目里程碑

**效果**：水平或垂直时间轴，节点可点击

**HTML结构**：
```html
<div class="timeline">
    <div class="timeline-line"></div>
    <div class="timeline-nodes">
        <div class="timeline-node" onclick="showTimelineDetail(0)">
            <div class="node-dot"></div>
            <div class="node-year">2017</div>
            <div class="node-title">Transformer</div>
        </div>
        <div class="timeline-node" onclick="showTimelineDetail(1)">
            <div class="node-dot"></div>
            <div class="node-year">2022</div>
            <div class="node-title">ChatGPT</div>
        </div>
    </div>
</div>
<div id="timelineDetail" class="detail-panel"></div>
```

---

## 3. 交互输入类

### 3.1 滑块调节器 (Slider)

**用途**：参数调节、范围选择、数值输入

**效果**：拖动滑块实时更新数值和效果

**HTML结构**：
```html
<div class="slider-control">
    <div class="slider-labels">
        <span>低</span>
        <span id="sliderValue">50</span>
        <span>高</span>
    </div>
    <input type="range" min="0" max="100" value="50" 
           class="slider" oninput="updateSlider(this.value)">
    <div id="sliderEffect" class="effect-preview"></div>
</div>
```

**JavaScript**：
```javascript
function updateSlider(value) {
    document.getElementById('sliderValue').textContent = value;
    
    // 根据值更新效果
    const effect = document.getElementById('sliderEffect');
    if (value < 30) {
        effect.textContent = '效果：保守';
        effect.style.color = '#6495ED';
    } else if (value > 70) {
        effect.textContent = '效果：激进';
        effect.style.color = '#FF6B6B';
    } else {
        effect.textContent = '效果：平衡';
        effect.style.color = '#d4af37';
    }
}
```

---

### 3.2 单选/多选组 (Radio/Checkbox Group)

**用途**：选择场景、分类展示、配置选项

**效果**：选择后即时反馈

**HTML结构**：
```html
<div class="radio-group">
    <label class="radio-item">
        <input type="radio" name="difficulty" value="easy" onchange="handleDifficulty(this)">
        <span class="radio-label">简单</span>
        <span class="radio-desc">适合初学者</span>
    </label>
    <label class="radio-item">
        <input type="radio" name="difficulty" value="medium" onchange="handleDifficulty(this)">
        <span class="radio-label">中等</span>
        <span class="radio-desc">有一定基础</span>
    </label>
    <label class="radio-item">
        <input type="radio" name="difficulty" value="hard" onchange="handleDifficulty(this)">
        <span class="radio-label">困难</span>
        <span class="radio-desc">挑战性内容</span>
    </label>
</div>
<div id="difficultyResult"></div>
```

---

### 3.3 实时输入反馈 (Real-time Input)

**用途**：计算器、转换器、实时预览

**效果**：输入时即时显示结果

**HTML结构**：
```html
<div class="realtime-calc">
    <input type="text" id="calcInput" placeholder="输入文本..." oninput="calculate(this.value)">
    <div class="calc-results">
        <div class="result-item">
            <span>字符数：</span>
            <span id="charCount">0</span>
        </div>
        <div class="result-item">
            <span>Token数：</span>
            <span id="tokenCount">0</span>
        </div>
    </div>
</div>
```

**JavaScript**：
```javascript
function calculate(input) {
    const chars = input.length;
    const tokens = Math.ceil(chars / 2); // 简化计算
    
    document.getElementById('charCount').textContent = chars;
    document.getElementById('tokenCount').textContent = tokens;
}
```

---

## 4. 知识检测类

### 4.1 选择题 (Multiple Choice)

**用途**：课堂测验、知识检查、概念验证

**效果**：选择后即时反馈对错

**HTML结构**：
```html
<div class="quiz-container">
    <p class="quiz-question">什么是大语言模型的核心机制？</p>
    <div class="quiz-options">
        <button class="quiz-option" onclick="checkAnswer(this, 'A')">
            A. 规则匹配
        </button>
        <button class="quiz-option" onclick="checkAnswer(this, 'B')">
            B. 概率预测
        </button>
        <button class="quiz-option" onclick="checkAnswer(this, 'C')">
            C. 数据库存储
        </button>
    </div>
    <div id="quizFeedback" class="quiz-feedback hidden"></div>
</div>
```

**JavaScript**：
```javascript
function checkAnswer(button, answer) {
    const correctAnswer = 'B';
    const feedback = document.getElementById('quizFeedback');
    
    // 重置所有选项样式
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = true;
    });
    
    if (answer === correctAnswer) {
        button.classList.add('correct');
        feedback.innerHTML = '<span class="correct-text">✓ 正确！</span> LLM通过概率预测生成文本。';
        feedback.className = 'quiz-feedback correct';
    } else {
        button.classList.add('incorrect');
        document.querySelector(`button[onclick="checkAnswer(this, '${correctAnswer}')"]`).classList.add('correct');
        feedback.innerHTML = '<span class="incorrect-text">✗ 错误。</span> 正确答案是B。';
        feedback.className = 'quiz-feedback incorrect';
    }
    
    feedback.classList.remove('hidden');
}
```

---

### 4.2 判断题 (True/False)

**用途**：概念辨析、快速检查

**效果**：判断后显示解析

**HTML结构**：
```html
<div class="true-false-quiz">
    <p class="tf-statement">大语言模型能理解文本的真正含义。</p>
    <div class="tf-buttons">
        <button class="tf-btn true-btn" onclick="judgeTF(this, false)">
            <span>正确</span>
        </button>
        <button class="tf-btn false-btn" onclick="judgeTF(this, true)">
            <span>错误</span>
        </button>
    </div>
    <div id="tfFeedback" class="tf-feedback hidden">
        <p class="tf-result"></p>
        <p class="tf-explanation"></p>
    </div>
</div>
```

**JavaScript**：
```javascript
function judgeTF(button, isCorrect) {
    const feedback = document.getElementById('tfFeedback');
    const result = feedback.querySelector('.tf-result');
    const explanation = feedback.querySelector('.tf-explanation');
    
    document.querySelectorAll('.tf-btn').forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        button.classList.add('correct');
        result.textContent = '✓ 回答正确！';
        result.className = 'tf-result correct-text';
    } else {
        button.classList.add('incorrect');
        result.textContent = '✗ 回答错误';
        result.className = 'tf-result incorrect-text';
    }
    
    explanation.textContent = '解析：LLM并不真正"理解"文本，它只是基于概率预测下一个词。';
    feedback.classList.remove('hidden');
}
```

---

## 组件选择指南

| 内容类型 | 推荐组件 | 原因 |
|---------|---------|------|
| 概念解释 | 卡片翻转、手风琴 | 逐步揭示信息 |
| 对比展示 | 标签页、对比条 | 清晰展示差异 |
| 流程说明 | 步骤流程、时间轴 | 展示先后顺序 |
| 数据展示 | 进度条、对比条 | 直观可视化 |
| 参数调节 | 滑块、单选组 | 实时反馈效果 |
| 知识检测 | 选择题、判断题 | 即时验证理解 |

---

## 最佳实践

1. **适度使用**：每页1-2个交互组件即可，过多会分散注意力
2. **明确反馈**：用户操作后必须有清晰的视觉反馈
3. **渐进展示**：复杂内容分步骤展示，避免信息过载
4. **保持一致**：同类组件的交互逻辑保持一致
5. **响应迅速**：交互反馈延迟不超过300ms
