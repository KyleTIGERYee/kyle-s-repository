# 使用示例

本文档提供交互式课件制作的实际示例，帮助理解如何应用本技能。

## 目录

1. [示例1：概念解释页](#示例1概念解释页)
2. [示例2：对比展示页](#示例2对比展示页)
3. [示例3：流程说明页](#示例3流程说明页)
4. [示例4：数据可视化页](#示例4数据可视化页)
5. [示例5：知识检测页](#示例5知识检测页)

---

## 示例1：概念解释页

### 场景
解释"什么是Token"这个概念

### 设计思路
- 左侧：SVG可视化图示
- 右侧：文字说明 + 交互式Token计算器

### 代码实现

```html
<section class="slide" data-index="3">
    <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
        <div class="mb-8">
            <span class="text-label text-accent">1.1.3 Core Mechanism</span>
            <h2 class="font-display text-title font-bold mt-4">Token是什么？</h2>
        </div>
        <div class="grid grid-cols-2 gap-12">
            <!-- 左侧：可视化 -->
            <div class="interactive-box">
                <h3 class="font-display text-subtitle font-semibold mb-6">Token分解示例</h3>
                <div class="space-y-6">
                    <div class="bg-surface-light/50 rounded-xl p-6">
                        <div class="text-body text-muted mb-3">输入："我"</div>
                        <div class="flex gap-2">
                            <span class="px-4 py-2 bg-accent/30 rounded-lg text-body">我</span>
                        </div>
                        <div class="text-body text-muted mt-3">= 1个token</div>
                    </div>
                    <div class="bg-surface-light/50 rounded-xl p-6">
                        <div class="text-body text-muted mb-3">输入："人工智能"</div>
                        <div class="flex gap-2">
                            <span class="px-4 py-2 bg-accent/30 rounded-lg text-body">人工</span>
                            <span class="px-4 py-2 bg-blue-500/30 rounded-lg text-body">智能</span>
                        </div>
                        <div class="text-body text-muted mt-3">= 2个tokens</div>
                    </div>
                </div>
            </div>
            
            <!-- 右侧：交互计算器 -->
            <div class="interactive-box">
                <h3 class="font-display text-subtitle font-semibold mb-6">Token计算器</h3>
                <div class="mb-6">
                    <textarea id="tokenInput" rows="3" 
                        class="w-full bg-surface-light/50 border-2 border-white/10 rounded-xl px-6 py-4 text-body focus:border-accent focus:outline-none resize-none" 
                        placeholder="输入文本，计算Token数量..."></textarea>
                </div>
                <button onclick="calculateTokens()" class="btn-action w-full mb-6">计算Token</button>
                <div id="tokenResult" class="hidden">
                    <div class="grid grid-cols-3 gap-4 mb-6">
                        <div class="bg-surface-light/50 rounded-xl p-6 text-center">
                            <div class="text-4xl font-display text-accent font-bold" id="tokenCount">0</div>
                            <div class="text-body text-muted mt-2">Token数量</div>
                        </div>
                        <div class="bg-surface-light/50 rounded-xl p-6 text-center">
                            <div class="text-4xl font-display text-accent font-bold" id="charCount">0</div>
                            <div class="text-body text-muted mt-2">字符数量</div>
                        </div>
                        <div class="bg-surface-light/50 rounded-xl p-6 text-center">
                            <div class="text-4xl font-display text-accent font-bold" id="wordCount">0</div>
                            <div class="text-body text-muted mt-2">词数量</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

### JavaScript

```javascript
function calculateTokens() {
    const input = document.getElementById('tokenInput').value;
    const resultDiv = document.getElementById('tokenResult');
    
    if (!input.trim()) {
        resultDiv.classList.add('hidden');
        return;
    }
    
    // Token计算逻辑
    const chars = input.length;
    const chineseChars = (input.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (input.match(/[a-zA-Z]+/g) || []).length;
    const tokens = Math.ceil(chineseChars / 2) + Math.ceil(englishWords / 0.75);
    
    document.getElementById('tokenCount').textContent = tokens;
    document.getElementById('charCount').textContent = chars;
    document.getElementById('wordCount').textContent = input.trim().split(/\s+/).length;
    
    resultDiv.classList.remove('hidden');
    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.5 });
}
```

---

## 示例2：对比展示页

### 场景
对比"差提示词"和"好提示词"的区别

### 设计思路
- 使用Tab切换展示两种提示词
- 左侧展示，右侧分析优缺点

### 代码实现

```html
<section class="slide" data-index="8">
    <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
        <div class="mb-8">
            <span class="text-label text-accent">1.5.1 Structured Prompt</span>
            <h2 class="font-display text-title font-bold mt-4">为什么需要结构化提示词？</h2>
        </div>
        <div class="grid grid-cols-2 gap-12">
            <!-- 左侧：对比展示 -->
            <div class="interactive-box">
                <div class="flex gap-4 mb-6">
                    <button onclick="showPromptTab('bad')" id="badTab" 
                        class="flex-1 py-4 rounded-xl bg-red-500/20 border-2 border-red-500 text-body font-semibold">
                        差提示词
                    </button>
                    <button onclick="showPromptTab('good')" id="goodTab" 
                        class="flex-1 py-4 rounded-xl bg-surface-light/50 border-2 border-white/10 text-body font-semibold">
                        好提示词
                    </button>
                </div>
                <div id="badPrompt" class="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
                    <p class="text-body text-muted mb-4">"帮我写个关于待出租的房间介绍"</p>
                    <div class="space-y-2 text-body">
                        <p class="text-red-400">❌ 不知道目标受众是谁</p>
                        <p class="text-red-400">❌ 不知道风格要求</p>
                        <p class="text-red-400">❌ 不知道需要多长</p>
                    </div>
                </div>
                <div id="goodPrompt" class="bg-green-500/10 rounded-xl p-6 border border-green-500/30 hidden">
                    <div class="space-y-3 text-body">
                        <p><span class="text-accent">【角色】</span>房产顾问</p>
                        <p><span class="text-accent">【任务】</span>为刚毕业的大学生写租房介绍</p>
                        <p><span class="text-accent">【要求】</span></p>
                        <ul class="ml-6 text-muted space-y-1">
                            <li>• 语气亲切友好</li>
                            <li>• 突出性价比和安全性</li>
                            <li>• 控制在200字以内</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- 右侧：要素说明 -->
            <div class="space-y-6">
                <h3 class="font-display text-subtitle font-semibold">结构化提示词要素</h3>
                <div class="space-y-4">
                    <div class="interactive-box flex items-center gap-6">
                        <div class="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span class="font-display text-2xl text-accent">1</span>
                        </div>
                        <div>
                            <h4 class="font-display text-xl font-semibold mb-1">角色</h4>
                            <p class="text-body text-muted">定义AI扮演的身份</p>
                        </div>
                    </div>
                    <div class="interactive-box flex items-center gap-6">
                        <div class="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span class="font-display text-2xl text-accent">2</span>
                        </div>
                        <div>
                            <h4 class="font-display text-xl font-semibold mb-1">任务</h4>
                            <p class="text-body text-muted">明确要AI做什么</p>
                        </div>
                    </div>
                    <div class="interactive-box flex items-center gap-6">
                        <div class="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span class="font-display text-2xl text-accent">3</span>
                        </div>
                        <div>
                            <h4 class="font-display text-xl font-semibold mb-1">要求</h4>
                            <p class="text-body text-muted">具体约束条件</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

### JavaScript

```javascript
function showPromptTab(tab) {
    const badPrompt = document.getElementById('badPrompt');
    const goodPrompt = document.getElementById('goodPrompt');
    const badTab = document.getElementById('badTab');
    const goodTab = document.getElementById('goodTab');
    
    if (tab === 'bad') {
        badPrompt.classList.remove('hidden');
        goodPrompt.classList.add('hidden');
        badTab.classList.add('bg-red-500/20', 'border-red-500');
        badTab.classList.remove('bg-surface-light/50', 'border-white/10');
        goodTab.classList.remove('bg-green-500/20', 'border-green-500');
        goodTab.classList.add('bg-surface-light/50', 'border-white/10');
    } else {
        badPrompt.classList.add('hidden');
        goodPrompt.classList.remove('hidden');
        goodTab.classList.add('bg-green-500/20', 'border-green-500');
        goodTab.classList.remove('bg-surface-light/50', 'border-white/10');
        badTab.classList.remove('bg-red-500/20', 'border-red-500');
        badTab.classList.add('bg-surface-light/50', 'border-white/10');
    }
}
```

---

## 示例3：流程说明页

### 场景
展示AI发展历程的时间线

### 设计思路
- 水平时间轴，节点可点击
- 点击节点显示详细信息

### 代码实现

```html
<section class="slide" data-index="5">
    <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
        <div class="mb-8">
            <span class="text-label text-accent">1.2.1 AI Evolution</span>
            <h2 class="font-display text-title font-bold mt-4">AI发展历程</h2>
        </div>
        <div class="interactive-box">
            <div class="relative">
                <div class="absolute left-0 right-0 top-1/2 h-2 bg-white/10 rounded-full"></div>
                <div class="relative flex justify-between items-center py-12">
                    <div class="timeline-node text-center cursor-pointer" onclick="showTimelineDetail(0)">
                        <div class="w-20 h-20 rounded-full bg-surface-light border-4 border-white/20 flex items-center justify-center mb-4 mx-auto hover:border-accent transition-all">
                            <span class="font-display text-xl">1950s</span>
                        </div>
                        <p class="text-body font-semibold">图灵测试</p>
                        <p class="text-body text-muted">AI概念诞生</p>
                    </div>
                    <div class="timeline-node text-center cursor-pointer" onclick="showTimelineDetail(1)">
                        <div class="w-20 h-20 rounded-full bg-surface-light border-4 border-white/20 flex items-center justify-center mb-4 mx-auto hover:border-accent transition-all">
                            <span class="font-display text-xl">2010s</span>
                        </div>
                        <p class="text-body font-semibold">深度学习</p>
                        <p class="text-body text-muted">神经网络复兴</p>
                    </div>
                    <div class="timeline-node text-center cursor-pointer" onclick="showTimelineDetail(2)">
                        <div class="w-20 h-20 rounded-full bg-surface-light border-4 border-white/20 flex items-center justify-center mb-4 mx-auto hover:border-accent transition-all">
                            <span class="font-display text-xl">2017</span>
                        </div>
                        <p class="text-body font-semibold">Transformer</p>
                        <p class="text-body text-muted">注意力机制</p>
                    </div>
                    <div class="timeline-node text-center cursor-pointer" onclick="showTimelineDetail(3)">
                        <div class="w-20 h-20 rounded-full bg-accent/30 border-4 border-accent flex items-center justify-center mb-4 mx-auto">
                            <span class="font-display text-xl">2022</span>
                        </div>
                        <p class="text-body font-semibold text-accent">ChatGPT</p>
                        <p class="text-body text-muted">大模型爆发</p>
                    </div>
                </div>
            </div>
            <div id="timelineDetail" class="mt-8 p-8 bg-surface-light/50 rounded-xl hidden">
                <p class="text-body" id="timelineText">点击上方时间节点查看详情</p>
            </div>
        </div>
    </div>
</section>
```

### JavaScript

```javascript
const timelineData = [
    '1950年，阿兰·图灵提出图灵测试，为判断机器是否具有智能提供了标准。这是人工智能概念的起点。',
    '2010年代，深度学习技术突破，神经网络重新兴起。AlexNet在ImageNet竞赛中的胜利开启了深度学习时代。',
    '2017年，Google发布Transformer架构论文《Attention Is All You Need》，注意力机制成为大模型的核心。',
    '2022年，OpenAI发布ChatGPT，大语言模型走进大众视野，引发了全球AI应用浪潮。'
];

function showTimelineDetail(index) {
    const detailDiv = document.getElementById('timelineDetail');
    const textDiv = document.getElementById('timelineText');
    
    textDiv.textContent = timelineData[index];
    detailDiv.classList.remove('hidden');
    
    gsap.from(detailDiv, { opacity: 0, y: 10, duration: 0.3 });
}
```

---

## 示例4：数据可视化页

### 场景
展示不同Temperature参数的效果对比

### 设计思路
- 滑块调节Temperature值
- 实时显示不同值的效果对比

### 代码实现

```html
<section class="slide" data-index="10">
    <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
        <div class="mb-8">
            <span class="text-label text-accent">1.3.3 Temperature</span>
            <h2 class="font-display text-title font-bold mt-4">如何选择Temperature？</h2>
        </div>
        <div class="interactive-box mb-8">
            <table class="w-full text-body">
                <thead>
                    <tr class="border-b border-white/20">
                        <th class="text-left py-4 px-4">场景</th>
                        <th class="text-left py-4 px-4">推荐Temperature</th>
                        <th class="text-left py-4 px-4">原因</th>
                    </tr>
                </thead>
                <tbody class="text-muted">
                    <tr class="border-b border-white/10">
                        <td class="py-4 px-4">代码生成</td>
                        <td class="py-4 px-4 text-accent">0.0 - 0.3</td>
                        <td class="py-4 px-4">需要准确无误</td>
                    </tr>
                    <tr class="border-b border-white/10">
                        <td class="py-4 px-4">创意写作</td>
                        <td class="py-4 px-4 text-accent">0.8 - 1.2</td>
                        <td class="py-4 px-4">需要多样性和创意</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="grid grid-cols-2 gap-8">
            <div class="interactive-box">
                <h4 class="font-display text-xl font-semibold mb-4">交互演示</h4>
                <div class="mb-4">
                    <div class="flex justify-between mb-2">
                        <span class="text-body text-muted">确定性</span>
                        <span class="text-body text-accent font-bold" id="tempValue">1.0</span>
                        <span class="text-body text-muted">创造性</span>
                    </div>
                    <input type="range" id="tempSlider" min="0" max="20" value="10" 
                        class="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        oninput="updateTemp(this.value)">
                </div>
                <button onclick="generateWithTemp()" class="btn-action w-full">生成广告语</button>
            </div>
            <div id="tempResult" class="interactive-box">
                <p class="text-body text-muted">调节滑块并点击生成，查看不同Temperature的效果</p>
            </div>
        </div>
    </div>
</section>
```

### JavaScript

```javascript
function updateTemp(value) {
    const temp = (value / 10).toFixed(1);
    document.getElementById('tempValue').textContent = temp;
}

const tempExamples = {
    low: ['加班到凌晨，喝它提精神！', '熬夜加班，能量满满！'],
    medium: ['夜再深，劲儿仍足！', '深夜加班，能量相伴！'],
    high: ['夜深人不蔫，罐启能量燃！', '深夜加班族，能量不打烊！']
};

function generateWithTemp() {
    const temp = parseFloat(document.getElementById('tempValue').textContent);
    const resultDiv = document.getElementById('tempResult');
    
    let examples;
    if (temp < 0.4) examples = tempExamples.low;
    else if (temp > 0.8) examples = tempExamples.high;
    else examples = tempExamples.medium;
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    
    resultDiv.innerHTML = `
        <p class="text-body text-muted mb-3">Temperature = ${temp} 时的输出：</p>
        <p class="text-body">"${randomExample}"</p>
    `;
    
    gsap.from(resultDiv, { opacity: 0, y: 10, duration: 0.3 });
}
```

---

## 示例5：知识检测页

### 场景
课程结束前的知识回顾检测

### 设计思路
- 使用卡片布局展示知识点
- 可选配选择题进行简单测试

### 代码实现

```html
<section class="slide" data-index="15">
    <div class="slide-content mx-auto h-full flex flex-col justify-center px-12">
        <div class="mb-8">
            <span class="text-label text-accent">Chapter Review</span>
            <h2 class="font-display text-title font-bold mt-4">知识回顾</h2>
        </div>
        <div class="grid grid-cols-2 gap-8">
            <div class="interactive-box">
                <h3 class="font-display text-subtitle font-semibold mb-6 flex items-center gap-3">
                    <span class="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">1</span>
                    大模型核心概念
                </h3>
                <ul class="space-y-3 text-body">
                    <li class="flex items-start gap-3">
                        <span class="text-accent">•</span>
                        <span>LLM基于概率预测生成文本</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-accent">•</span>
                        <span>Token是模型处理的基本单位</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-accent">•</span>
                        <span>输出具有非确定性特征</span>
                    </li>
                </ul>
            </div>
            <div class="interactive-box">
                <h3 class="font-display text-subtitle font-semibold mb-6 flex items-center gap-3">
                    <span class="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">2</span>
                    技术原理
                </h3>
                <ul class="space-y-3 text-body">
                    <li class="flex items-start gap-3">
                        <span class="text-accent">•</span>
                        <span>Transformer架构与注意力机制</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-accent">•</span>
                        <span>上下文窗口决定记忆长度</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <span class="text-accent">•</span>
                        <span>Temperature控制输出随机性</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</section>
```

---

## 快速开始模板

### 最小可用课件结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>课件标题</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        .slide-content { width: 95% !important; max-width: 1600px !important; }
        .text-body { font-size: 1.5rem !important; }
        .text-title { font-size: 3rem !important; }
        .slide { position: absolute; inset: 0; opacity: 0; visibility: hidden; }
        .slide.active { opacity: 1; visibility: visible; }
    </style>
</head>
<body class="bg-gray-900 text-white overflow-hidden">
    <div id="presentation" class="relative w-full h-screen">
        <div id="slides-container">
            <!-- 幻灯片内容 -->
        </div>
        <!-- 导航控制 -->
    </div>
    <script src="js/app.js"></script>
</body>
</html>
```

### 推荐制作流程

1. **准备阶段**
   - 通读讲义，标记重点
   - 规划每页内容和交互
   - 准备SVG图表素材

2. **开发阶段**
   - 先搭建幻灯片框架
   - 填充讲义原文内容
   - 添加交互组件
   - 实现JavaScript逻辑

3. **优化阶段**
   - 测试所有交互
   - 检查键盘导航
   - 优化动画性能
   - 验证移动端适配
