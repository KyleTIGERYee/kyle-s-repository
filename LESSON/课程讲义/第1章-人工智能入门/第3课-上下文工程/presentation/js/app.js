/**
 * 第3课：上下文工程 - 交互式课件 JavaScript
 * Context Engineering Interactive Courseware
 */

// ============================================
// 全局状态管理
// ============================================
const CourseState = {
    currentSlide: 0,
    totalSlides: 21,
    isAnimating: false,
    tokenCount: 0,
    contextRounds: 5,
    attentionDemo: {
        round: 1,
        userInfo: { name: '张三', budget: '3000', area: '西乡' }
    }
};

// ============================================
// Token计算器
// ============================================
class TokenCalculator {
    constructor() {
        this.input = document.getElementById('tokenInput');
        this.countDisplay = document.getElementById('tokenCount');
        this.chineseRate = 0.6;  // 1 token ≈ 0.6 中文字符
        this.englishRate = 0.75; // 1 token ≈ 0.75 英文单词
        
        if (this.input && this.countDisplay) {
            this.init();
        }
    }
    
    init() {
        this.input.addEventListener('input', () => this.calculate());
        this.input.addEventListener('keyup', () => this.calculate());
    }
    
    calculate() {
        const text = this.input.value;
        if (!text) {
            this.animateCount(0);
            return;
        }
        
        // 简单估算：中文字符 + 英文单词
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        const otherChars = text.length - chineseChars - englishWords;
        
        const tokens = Math.ceil(
            chineseChars / this.chineseRate + 
            englishWords / this.englishRate +
            otherChars * 0.5
        );
        
        this.animateCount(tokens);
    }
    
    animateCount(target) {
        const current = parseInt(this.countDisplay.textContent) || 0;
        const diff = target - current;
        const steps = 10;
        const stepValue = diff / steps;
        let step = 0;
        
        const interval = setInterval(() => {
            step++;
            const value = Math.round(current + stepValue * step);
            this.countDisplay.textContent = value;
            
            if (step >= steps) {
                this.countDisplay.textContent = target;
                clearInterval(interval);
            }
        }, 20);
    }
}

// ============================================
// 上下文轮数滑块
// ============================================
class ContextSlider {
    constructor() {
        this.slider = document.getElementById('contextSlider');
        this.valueDisplay = document.getElementById('roundValue');
        this.costDisplay = document.getElementById('costEstimate');
        
        if (this.slider && this.valueDisplay) {
            this.init();
        }
    }
    
    init() {
        this.slider.addEventListener('input', (e) => this.update(e.target.value));
    }
    
    update(value) {
        CourseState.contextRounds = parseInt(value);
        
        // 更新显示
        this.valueDisplay.textContent = value;
        
        // 更新成本估算
        if (this.costDisplay) {
            const cost = this.estimateCost(value);
            this.costDisplay.textContent = cost;
        }
        
        // 更新建议
        this.updateRecommendation(value);
    }
    
    estimateCost(rounds) {
        // 假设每轮平均消耗 500 tokens
        const tokensPerRound = 500;
        const totalTokens = rounds * tokensPerRound;
        
        if (rounds <= 3) return `约 ${totalTokens} tokens/轮 - 成本较低 💰`;
        if (rounds <= 10) return `约 ${totalTokens} tokens/轮 - 成本适中 💰💰`;
        if (rounds <= 20) return `约 ${totalTokens} tokens/轮 - 成本较高 💰💰💰`;
        return `约 ${totalTokens}+ tokens/轮 - 成本最高 💰💰💰💰`;
    }
    
    updateRecommendation(value) {
        const recElement = document.getElementById('roundRecommendation');
        if (!recElement) return;
        
        let recommendation = '';
        let color = '';
        
        if (value <= 3) {
            recommendation = '适合：简单问答、独立任务';
            color = '#22C55E';
        } else if (value <= 10) {
            recommendation = '适合：一般对话、需求挖掘';
            color = '#4F46E5';
        } else if (value <= 20) {
            recommendation = '适合：深度咨询、复杂任务';
            color = '#F59E0B';
        } else {
            recommendation = '适合：长文档分析、深度对话';
            color = '#EF4444';
        }
        
        recElement.textContent = recommendation;
        recElement.style.color = color;
    }
}

// 全局更新函数（供HTML调用）
function updateContextRounds(value) {
    const slider = new ContextSlider();
    slider.update(value);
}

// ============================================
// 注意力稀释演示
// ============================================
class AttentionDemo {
    constructor() {
        this.round = 1;
        this.maxRounds = 22;
        this.userInfo = {
            name: '张三',
            budget: '3000',
            area: '西乡'
        };
        
        this.dialogueHistory = [
            { role: 'user', content: '我叫张三，想找西乡的房，预算3000' },
            { role: 'ai', content: '好的张三，西乡有很多优质房源，3000元预算可以租到不错的单间。' }
        ];
        
        this.init();
    }
    
    init() {
        // 预生成后续对话
        this.generateDialogue();
    }
    
    generateDialogue() {
        const topics = [
            '西乡地铁站附近有什么房源？',
            '押一付一吗？',
            '可以养宠物吗？',
            '有独立卫生间吗？',
            '水电费怎么算？',
            '最短租期是多久？',
            '能看房吗？',
            '需要押金吗？',
            '有网络吗？',
            '家具齐全吗？',
            '能做饭吗？',
            '有停车位吗？',
            '周边有什么配套？',
            '安全吗？',
            '什么时候可以入住？',
            '怎么签约？',
            '可以转租吗？',
            '退租怎么退押金？',
            '有优惠活动吗？',
            '能便宜点吗？'
        ];
        
        topics.forEach((topic, index) => {
            this.dialogueHistory.push({
                role: 'user',
                content: topic
            });
            this.dialogueHistory.push({
                role: 'ai',
                content: `关于${topic.replace('吗？', '')}的问题，让我为您查询一下...`
            });
        });
    }
    
    nextRound() {
        if (this.round < this.maxRounds) {
            this.round += 2;
            this.updateDisplay();
        }
    }
    
    reset() {
        this.round = 1;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const container = document.getElementById('attentionDemo');
        if (!container) return;
        
        // 计算注意力分数
        const attentionScore = Math.max(10, 100 - (this.round - 1) * 4);
        
        // 生成HTML
        let html = `
            <div class="mb-4 flex justify-between items-center">
                <span class="text-body font-semibold">当前轮数: ${this.round}/22</span>
                <span class="text-body" style="color: ${attentionScore > 50 ? '#22C55E' : attentionScore > 30 ? '#F59E0B' : '#EF4444'}">
                    注意力保持: ${attentionScore}%
                </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div class="h-4 rounded-full transition-all duration-500" 
                     style="width: ${attentionScore}%; background: linear-gradient(90deg, #22C55E 0%, ${attentionScore > 50 ? '#22C55E' : attentionScore > 30 ? '#F59E0B' : '#EF4444'} 100%)">
                </div>
            </div>
        `;
        
        // 显示最近的对话
        const recentDialogue = this.dialogueHistory.slice(Math.max(0, this.round - 3), this.round);
        html += '<div class="space-y-3 max-h-64 overflow-y-auto">';
        
        recentDialogue.forEach((msg, idx) => {
            const isUser = msg.role === 'user';
            const isOld = idx < recentDialogue.length - 2;
            const opacity = isOld ? 'opacity-50' : 'opacity-100';
            
            html += `
                <div class="flex ${isUser ? 'justify-end' : 'justify-start'} ${opacity}">
                    <div class="max-w-3/4 p-3 rounded-xl ${isUser ? 'bg-primary text-white' : 'bg-gray-100'}"
                         style="${isUser ? 'background: linear-gradient(135deg, #4F46E5 0%, #818CF8 100%);' : ''}">
                        <p class="text-sm">${msg.content}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // 测试问题
        if (this.round > 10) {
            html += `
                <div class="mt-6 p-4 rounded-xl" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                    <p class="text-body font-semibold mb-2">🧪 测试问题：</p>
                    <p class="text-body">"我上次说的预算你还记得吗？"</p>
                    <p class="text-sm text-muted mt-2">
                        ${attentionScore > 50 ? '✅ AI可能记得（注意力充足）' : '⚠️ AI可能忘记（注意力稀释）'}
                    </p>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
}

// 全局函数
let attentionDemoInstance = null;

function initAttentionDemo() {
    if (!attentionDemoInstance) {
        attentionDemoInstance = new AttentionDemo();
    }
    attentionDemoInstance.updateDisplay();
}

function nextAttentionRound() {
    if (attentionDemoInstance) {
        attentionDemoInstance.nextRound();
    }
}

function resetAttentionDemo() {
    if (attentionDemoInstance) {
        attentionDemoInstance.reset();
    }
}

// ============================================
// 幻灯片导航
// ============================================
class SlideNavigator {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.container = document.getElementById('slides-container');
        this.progressBar = document.getElementById('progress-fill');
        this.pageIndicator = document.getElementById('page-indicator');
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.prev();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.goTo(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.goTo(this.slides.length - 1);
            }
        });
        
        // 触摸滑动支持
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartY, touchEndY);
        }, { passive: true });
        
        // 鼠标滚轮
        let wheelTimeout = null;
        document.addEventListener('wheel', (e) => {
            if (wheelTimeout) return;
            
            wheelTimeout = setTimeout(() => {
                wheelTimeout = null;
            }, 500);
            
            if (e.deltaY > 0) {
                this.next();
            } else if (e.deltaY < 0) {
                this.prev();
            }
        }, { passive: true });
        
        // 初始化显示
        this.updateDisplay();
        
        // 显示第一页幻灯片
        this.goTo(0);
    }
    
    handleSwipe(startY, endY) {
        const threshold = 50;
        if (startY - endY > threshold) {
            this.next();
        } else if (endY - startY > threshold) {
            this.prev();
        }
    }
    
    next() {
        if (CourseState.currentSlide < this.slides.length - 1) {
            this.goTo(CourseState.currentSlide + 1);
        }
    }
    
    prev() {
        if (CourseState.currentSlide > 0) {
            this.goTo(CourseState.currentSlide - 1);
        }
    }
    
    goTo(index) {
        if (index < 0 || index >= this.slides.length) return;
        if (CourseState.isAnimating) return;
        
        CourseState.isAnimating = true;
        CourseState.currentSlide = index;
        
        // 更新幻灯片显示
        this.slides.forEach((slide, i) => {
            if (i === index) {
                slide.style.opacity = '1';
                slide.style.visibility = 'visible';
                slide.style.zIndex = '10';
            } else {
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
                slide.style.zIndex = '1';
            }
        });
        
        // 更新进度
        this.updateDisplay();
        
        // 触发页面特定初始化
        this.onSlideChange(index);
        
        setTimeout(() => {
            CourseState.isAnimating = false;
        }, 600);
    }
    
    updateDisplay() {
        const progress = ((CourseState.currentSlide + 1) / this.slides.length) * 100;
        
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        
        if (this.pageIndicator) {
            this.pageIndicator.textContent = `${CourseState.currentSlide + 1} / ${this.slides.length}`;
        }
        
        // 更新翻页按钮状态
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentSlideEl = document.getElementById('currentSlide');
        const totalSlidesEl = document.getElementById('totalSlides');
        
        if (prevBtn) {
            prevBtn.disabled = CourseState.currentSlide === 0;
            prevBtn.classList.toggle('opacity-50', CourseState.currentSlide === 0);
        }
        
        if (nextBtn) {
            nextBtn.disabled = CourseState.currentSlide === this.slides.length - 1;
            nextBtn.classList.toggle('opacity-50', CourseState.currentSlide === this.slides.length - 1);
        }
        
        if (currentSlideEl) {
            currentSlideEl.textContent = CourseState.currentSlide + 1;
        }
        
        if (totalSlidesEl) {
            totalSlidesEl.textContent = this.slides.length;
        }
        
        // 更新页面指示点
        updateSlideDots(CourseState.currentSlide);
    }
    
    onSlideChange(index) {
        // 触发动画
        const slide = this.slides[index];
        if (slide) {
            animateSlideContent(slide);
        }
        
        // 根据页面索引触发特定初始化
        switch(index) {
            case 3: // Token计算器页面
                if (!window.tokenCalculator) {
                    window.tokenCalculator = new TokenCalculator();
                }
                break;
            case 7: // 上下文轮数页面
                if (!window.contextSlider) {
                    window.contextSlider = new ContextSlider();
                }
                break;
            case 9: // 注意力稀释演示页面
                initAttentionDemo();
                break;
        }
    }
}

// ============================================
// 滑动对比器组件
// ============================================
class ComparisonSlider {
    constructor(containerId, beforeImage, afterImage) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.beforeImage = beforeImage;
        this.afterImage = afterImage;
        this.position = 50;
        
        this.render();
        this.init();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="relative w-full h-64 rounded-2xl overflow-hidden cursor-ew-resize" style="background: #f5f5f5;">
                <div class="absolute inset-0 flex items-center justify-center text-muted">
                    ${this.afterImage}
                </div>
                <div class="absolute inset-0 flex items-center justify-center text-muted" 
                     style="clip-path: inset(0 ${100 - this.position}% 0 0); background: #e5e5e5;">
                    ${this.beforeImage}
                </div>
                <div class="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize" 
                     style="left: ${this.position}%; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                w-8 h-8 rounded-full bg-white flex items-center justify-center"
                         style="box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                        <span class="text-xs">↔</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    init() {
        const slider = this.container.querySelector('.relative');
        let isDragging = false;
        
        const updatePosition = (e) => {
            const rect = slider.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            this.position = Math.max(0, Math.min(100, (x / rect.width) * 100));
            this.render();
        };
        
        slider.addEventListener('mousedown', () => isDragging = true);
        slider.addEventListener('touchstart', () => isDragging = true);
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) updatePosition(e);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) updatePosition(e);
        });
        
        document.addEventListener('mouseup', () => isDragging = false);
        document.addEventListener('touchend', () => isDragging = false);
    }
}

// ============================================
// 步骤流程图动画
// ============================================
class StepFlowAnimation {
    constructor(containerId, steps) {
        this.container = document.getElementById(containerId);
        this.steps = steps;
        this.currentStep = 0;
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        let html = '<div class="flex items-center justify-between">';
        
        this.steps.forEach((step, index) => {
            const isActive = index <= this.currentStep;
            const isCurrent = index === this.currentStep;
            
            html += `
                <div class="flex-1 text-center relative">
                    <div class="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center transition-all duration-500
                                ${isActive ? 'scale-110' : 'scale-100'}"
                         style="background: ${isActive ? 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)' : '#e5e5e5'};
                                box-shadow: ${isCurrent ? '0 8px 32px rgba(79, 70, 229, 0.4)' : 'none'};">
                        <span class="text-2xl">${step.icon}</span>
                    </div>
                    <h4 class="font-semibold ${isActive ? 'text-primary' : 'text-muted'}">${step.title}</h4>
                    <p class="text-sm text-muted mt-1">${step.desc}</p>
                    ${index < this.steps.length - 1 ? `
                        <div class="absolute top-8 left-1/2 w-full h-1 -z-10"
                             style="background: ${index < this.currentStep ? 'linear-gradient(90deg, #4F46E5, #818CF8)' : '#e5e5e5'};">
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
    }
    
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
        }
    }
    
    reset() {
        this.currentStep = 0;
        this.render();
    }
}

// ============================================
// 概念关系图谱
// ============================================
class ConceptMap {
    constructor(containerId, concepts, relations) {
        this.container = document.getElementById(containerId);
        this.concepts = concepts;
        this.relations = relations;
        
        if (this.container) {
            this.render();
        }
    }
    
    render() {
        const width = this.container.clientWidth;
        const height = 400;
        
        let html = `
            <svg viewBox="0 0 ${width} ${height}" class="w-full">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                            refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#4F46E5" />
                    </marker>
                </defs>
        `;
        
        // 绘制连线
        this.relations.forEach(rel => {
            const from = this.concepts[rel.from];
            const to = this.concepts[rel.to];
            
            html += `
                <line x1="${from.x}" y1="${from.y}" 
                      x2="${to.x}" y2="${to.y}"
                      stroke="#4F46E5" stroke-width="2" 
                      marker-end="url(#arrowhead)"
                      opacity="0.6"/>
            `;
        });
        
        // 绘制节点
        this.concepts.forEach((concept, index) => {
            html += `
                <g class="concept-node" style="cursor: pointer;" 
                   onclick="highlightConcept(${index})">
                    <circle cx="${concept.x}" cy="${concept.y}" r="40"
                            fill="url(#gradient-${index})"
                            style="filter: drop-shadow(0 4px 12px rgba(79, 70, 229, 0.3));"/>
                    <text x="${concept.x}" y="${concept.y - 5}" 
                          text-anchor="middle" fill="white" font-size="14" font-weight="bold">
                        ${concept.name}
                    </text>
                    <text x="${concept.x}" y="${concept.y + 15}" 
                          text-anchor="middle" fill="white" font-size="10">
                        ${concept.subtitle}
                    </text>
                    <defs>
                        <linearGradient id="gradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:${concept.color1};stop-opacity:1" />
                            <stop offset="100%" style="stop-color:${concept.color2};stop-opacity:1" />
                        </linearGradient>
                    </defs>
                </g>
            `;
        });
        
        html += '</svg>';
        this.container.innerHTML = html;
    }
}

// ============================================
// 对话模拟器
// ============================================
class DialogueSimulator {
    constructor(containerId, scenario) {
        this.container = document.getElementById(containerId);
        this.scenario = scenario;
        this.currentTurn = 0;
        this.messages = [];
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        this.render();
        this.addMessage('ai', this.scenario.welcome);
    }
    
    render() {
        this.container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div class="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                    <h4 class="font-semibold">${this.scenario.title}</h4>
                </div>
                <div id="chat-messages" class="h-80 overflow-y-auto p-4 space-y-4">
                </div>
                <div class="p-4 border-t">
                    <div class="flex gap-2">
                        ${this.scenario.options.map((opt, idx) => `
                            <button onclick="dialogue.selectOption(${idx})" 
                                    class="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all
                                           hover:scale-105 active:scale-95"
                                    style="background: rgba(79, 70, 229, 0.1); border: 2px solid rgba(79, 70, 229, 0.2); color: #4F46E5;">
                                ${opt.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    addMessage(role, content) {
        const messagesContainer = this.container.querySelector('#chat-messages');
        const isUser = role === 'user';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`;
        messageDiv.innerHTML = `
            <div class="max-w-3/4 p-3 rounded-2xl ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
                        ${isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}"
                 style="${isUser ? 'background: linear-gradient(135deg, #4F46E5 0%, #818CF8 100%);' : ''}">
                <p class="text-sm">${content}</p>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    selectOption(index) {
        const option = this.scenario.options[index];
        this.addMessage('user', option.text);
        
        setTimeout(() => {
            this.addMessage('ai', option.response);
        }, 500);
    }
}

// ============================================
// 动画效果
// ============================================
class AnimationEffects {
    static fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }
    
    static slideUp(element, duration = 500, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all ${duration}ms ease ${delay}ms`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }
    
    static stagger(elements, duration = 500, staggerDelay = 100) {
        elements.forEach((el, index) => {
            this.slideUp(el, duration, index * staggerDelay);
        });
    }
    
    static pulse(element) {
        element.style.animation = 'pulse 2s infinite';
    }
    
    static shake(element) {
        element.style.animation = 'shake 0.5s';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// ============================================
// 工具函数
// ============================================
const Utils = {
    // 防抖
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 格式化数字
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 初始化幻灯片导航
    window.slideNavigator = new SlideNavigator();
    
    // 初始化Token计算器
    window.tokenCalculator = new TokenCalculator();
    
    // 初始化上下文滑块
    window.contextSlider = new ContextSlider();
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
            animation: fade-in 0.3s ease forwards;
        }
        
        .slide {
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* 自定义滚动条 */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(79, 70, 229, 0.1);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #4F46E5 0%, #818CF8 100%);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #4338CA 0%, #6366F1 100%);
        }
    `;
    document.head.appendChild(style);
    
    // 添加页面可见性检测，优化性能
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.body.classList.add('paused');
        } else {
            document.body.classList.remove('paused');
        }
    });
    
    // 初始化粒子效果
    initParticles();
    
    // 初始化页面指示点
    initSlideDots();
    
    // 初始化GSAP动画
    initGSAPAnimations();
    
    console.log('🎓 第3课：上下文工程 - 课件已加载');
    console.log('⌨️ 键盘导航：↑↓←→ 或空格键切换页面');
    console.log('📱 触摸设备：上下滑动切换页面');
});

// ============================================
// 粒子效果
// ============================================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
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

// ============================================
// 页面指示点
// ============================================
function initSlideDots() {
    const dotsContainer = document.querySelector('.ui-element.fixed.right-8');
    if (!dotsContainer) return;
    
    const totalSlides = 21;
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `slide-dot w-3 h-3 rounded-full bg-white/30 cursor-pointer transition-all ${i === 0 ? 'bg-primary scale-125' : ''}`;
        dot.onclick = () => {
            if (window.slideNavigator) {
                window.slideNavigator.goTo(i);
            }
        };
        dotsContainer.appendChild(dot);
    }
}

// ============================================
// GSAP动画
// ============================================
function initGSAPAnimations() {
    // 监听幻灯片切换，触发动画
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const slide = mutation.target;
                if (slide.style.opacity === '1') {
                    animateSlideContent(slide);
                }
            }
        });
    });
    
    document.querySelectorAll('.slide').forEach(slide => {
        observer.observe(slide, { attributes: true });
    });
}

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

// 更新页面指示点
function updateSlideDots(index) {
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('bg-primary', 'scale-125');
            dot.classList.remove('bg-white/30');
        } else {
            dot.classList.remove('bg-primary', 'scale-125');
            dot.classList.add('bg-white/30');
        }
    });
}

// ============================================
// 全局导航函数
// ============================================
function prevSlide() {
    if (window.slideNavigator) {
        window.slideNavigator.prev();
    }
}

function nextSlide() {
    if (window.slideNavigator) {
        window.slideNavigator.next();
    }
}

// ============================================
// 全局导出
// ============================================
window.CourseState = CourseState;
window.Utils = Utils;
window.AnimationEffects = AnimationEffects;
window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
