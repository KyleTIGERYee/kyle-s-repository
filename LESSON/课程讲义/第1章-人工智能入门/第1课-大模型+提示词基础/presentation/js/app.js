// AI课程演示文稿 - 交互式课件逻辑

// ==================== 全局状态 ====================
let currentSlide = 0;
const totalSlides = 23;
let isFullscreen = false;

// ==================== 幻灯片导航 ====================
function initSlides() {
    const dotsContainer = document.querySelector('.ui-element.fixed.right-8');
    
    // 生成页面指示点
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `slide-dot w-3 h-3 rounded-full bg-white/30 cursor-pointer transition-all ${i === 0 ? 'bg-primary scale-125' : ''}`;
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
    
    updateSlideDisplay();
}

function updateSlideDisplay() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dot');
    
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
    
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('bg-primary', 'scale-125');
            dot.classList.remove('bg-white/30');
        } else {
            dot.classList.remove('bg-primary', 'scale-125');
            dot.classList.add('bg-white/30');
        }
    });
    
    // 更新页码
    document.getElementById('currentSlide').textContent = currentSlide + 1;
    document.getElementById('totalSlides').textContent = totalSlides;
    
    // 更新进度条
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // 更新按钮状态
    document.getElementById('prevBtn').disabled = currentSlide === 0;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
    
    // 触发动画
    animateSlideContent();
}

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlideDisplay();
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlideDisplay();
    }
}

function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
        currentSlide = index;
        updateSlideDisplay();
    }
}

function animateSlideContent() {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;
    
    const elements = activeSlide.querySelectorAll('.interactive-box, .text-title, .text-subtitle, .text-body, svg');
    
    gsap.fromTo(elements, 
        { opacity: 0, y: 30 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            stagger: 0.1,
            ease: 'power3.out'
        }
    );
}

// ==================== 键盘控制 ====================
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

// ==================== 全屏功能 ====================
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

// ==================== 模型信息展示 ====================
const modelInfoData = {
    deepseek: 'DeepSeek（深度求索）：中国AI公司深度求索开发的大语言模型，以高性价比和强大的推理能力著称。',
    qwen: '通义千问：阿里巴巴达摩院开发的大语言模型，在中文理解和生成方面表现优异。',
    doubao: '豆包：字节跳动开发的AI助手，集成在抖音、今日头条等产品中，用户基数庞大。',
    gpt: 'GPT系列：OpenAI开发的生成式预训练模型，ChatGPT让大语言模型走进大众视野。',
    claude: 'Claude：Anthropic开发的AI助手，以安全性和长上下文窗口著称。',
    gemini: 'Gemini：Google开发的多模态大模型，支持文本、图像、音频等多种输入。'
};

function showModelInfo(model) {
    const infoDiv = document.getElementById('modelInfo');
    const textDiv = document.getElementById('modelInfoText');
    
    textDiv.textContent = modelInfoData[model] || '模型信息';
    infoDiv.classList.remove('hidden');
    
    gsap.from(infoDiv, { opacity: 0, y: 10, duration: 0.3 });
}

// ==================== 概率预测交互 ====================
const predictions = {
    '今天天气很': [
        { word: '好', prob: 75 },
        { word: '热', prob: 10 },
        { word: '冷', prob: 10 },
        { word: '糟糕', prob: 5 }
    ],
    '我想吃': [
        { word: '火锅', prob: 40 },
        { word: '披萨', prob: 25 },
        { word: '寿司', prob: 20 },
        { word: '汉堡', prob: 15 }
    ],
    '明天要去': [
        { word: '上班', prob: 50 },
        { word: '旅行', prob: 20 },
        { word: '医院', prob: 15 },
        { word: '学校', prob: 15 }
    ]
};

function predictNext() {
    const input = document.getElementById('probInput').value;
    const resultDiv = document.getElementById('probResult');
    
    // 查找匹配或默认
    let preds = predictions[Object.keys(predictions).find(k => input.includes(k))] || predictions['今天天气很'];
    
    // 重新渲染概率条
    let html = '<p class="text-body text-muted mb-4">AI计算的概率分布：</p><div class="space-y-4">';
    preds.forEach((pred, i) => {
        html += `
            <div>
                <div class="flex justify-between text-body mb-2">
                    <span>"${pred.word}"</span>
                    <span class="${i === 0 ? 'text-primary font-bold' : 'text-muted'}">${pred.prob}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${pred.prob}%; opacity: ${i === 0 ? 1 : 0.3 + (pred.prob / 100) * 0.5}"></div>
                </div>
            </div>
        `;
    });
    html += `</div><div class="mt-6 p-6 bg-primary/20 rounded-xl border-2 border-primary text-center">
        <p class="text-subtitle text-primary font-bold">AI选择："${preds[0].word}"（概率最高）</p>
    </div>`;
    
    resultDiv.innerHTML = html;
    
    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.5 });
}

// ==================== Token计算器（参考阿里云Tokenizer）====================
function calculateTokens() {
    const input = document.getElementById('tokenInput').value;
    const resultDiv = document.getElementById('tokenResult');
    
    if (!input.trim()) {
        resultDiv.classList.add('hidden');
        return;
    }
    
    // 参考阿里云Tokenizer逻辑
    // 中文：1个token ≈ 0.5个汉字（约2个汉字1个token）
    // 英文：1个token ≈ 0.75个单词（约1.3个token per word）
    const chars = input.length;
    const words = input.trim().split(/\s+/).length;
    
    // 计算中文字符和英文单词
    const chineseChars = (input.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (input.match(/[a-zA-Z]+/g) || []).length;
    const punctuation = (input.match(/[，。！？、；：""''（）【】《》.,!?;:'"()[\]{}]/g) || []).length;
    
    // 估算token数量（参考通义千问的tokenization规则）
    // 中文：约2个字符1个token
    // 英文：约0.75个单词1个token
    // 标点：通常单独算token
    const chineseTokens = Math.ceil(chineseChars / 2);
    const englishTokens = Math.ceil(englishWords / 0.75);
    const punctuationTokens = punctuation;
    
    const tokens = chineseTokens + englishTokens + punctuationTokens;
    
    document.getElementById('tokenCount').textContent = tokens;
    document.getElementById('charCount').textContent = chars;
    document.getElementById('wordCount').textContent = words;
    
    // Token分解可视化
    const breakdownDiv = document.getElementById('tokenBreakdown');
    let breakdownHtml = '';
    
    // 简单分解展示
    for (let i = 0; i < Math.min(input.length, 20); i++) {
        const char = input[i];
        const isChinese = /[\u4e00-\u9fa5]/.test(char);
        const isPunctuation = /[，。！？、；：""''（）【】《》.,!?;:'"()[\]{}]/.test(char);
        let bgClass = 'bg-primary/30';
        if (isPunctuation) bgClass = 'bg-blue-500/30';
        else if (!isChinese) bgClass = 'bg-green-500/30';
        breakdownHtml += `<span class="px-3 py-2 ${bgClass} rounded-lg text-body">${char}</span>`;
    }
    if (input.length > 20) {
        breakdownHtml += `<span class="px-3 py-2 bg-surface-light/50 rounded-lg text-body">...</span>`;
    }
    
    breakdownDiv.innerHTML = breakdownHtml;
    resultDiv.classList.remove('hidden');
    
    gsap.from(resultDiv, { opacity: 0, y: 20, duration: 0.5 });
}

// ==================== 时间轴详情 ====================
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

// ==================== 架构详情 ====================
const archDetails = {
    attention: '注意力机制（Attention）：让模型能够关注输入序列的不同部分，理解词语之间的关系。这是Transformer的核心创新。',
    ffn: '前馈神经网络（Feed-Forward Network）：对注意力层的输出进行进一步处理，增加模型的表达能力。'
};

function showArchDetail(component) {
    const detailDiv = document.getElementById('archDetail');
    detailDiv.innerHTML = `<p class="text-body">${archDetails[component]}</p>`;
    
    gsap.from(detailDiv, { opacity: 0, x: 20, duration: 0.3 });
}

// ==================== 注意力可视化 ====================
function showAttention() {
    // 高亮"它"字
    const targetWord = document.getElementById('targetWord');
    if (targetWord) {
        targetWord.style.background = 'rgba(79, 70, 229, 0.5)';
    }
    
    // 动画展示注意力条
    const bars = document.querySelectorAll('#attentionBars .progress-fill');
    bars.forEach((bar, i) => {
        setTimeout(() => {
            bar.style.width = bar.style.width;
        }, i * 100);
    });
    
    gsap.from('#attentionViz', { opacity: 0, x: 30, duration: 0.5 });
}

// ==================== Temperature控制 ====================
function updateTemp(value) {
    const temp = (value / 10).toFixed(1);
    document.getElementById('tempValue').textContent = temp;
}

// 使用讲义中的例子
const tempExamples = {
    low: [
        '加班到凌晨，喝它提精神！',
        '熬夜加班，能量满满！',
        '深夜加班，精神不打折！'
    ],
    medium: [
        '夜再深，劲儿仍足！',
        '深夜加班，能量相伴！',
        '加班到深夜，能量不掉线！'
    ],
    high: [
        '夜深人不蔫，罐启能量燃！',
        '深夜加班族，能量不打烊！',
        '夜越深，劲越足！'
    ]
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

// ==================== 提示词对比 ====================
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

// ==================== 粒子背景 ====================
function initParticleBackground() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
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
    
    const drawConnections = () => {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(79, 70, 229, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    };
    
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawConnections();
        
        requestAnimationFrame(animate);
    };
    
    animate();
}

// ==================== 触摸滑动支持 ====================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
}, { passive: true });

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initSlides();
    initParticleBackground();
    
    // 防止空格键滚动
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
        }
    });
});
