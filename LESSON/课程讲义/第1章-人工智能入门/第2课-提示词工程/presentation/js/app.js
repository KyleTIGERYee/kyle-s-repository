/**
 * 提示词工程课程课件 - 交互逻辑
 * Claymorphism风格 + GSAP动画
 */

// ========================================
// 全局状态
// ========================================
let currentSlide = 0;
const totalSlides = 25;
let isAnimating = false;

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initKeyboardControls();
    initTouchControls();
    initParticles();
    initFrameworkAnimations();
    initTypewriterEffects();
    initSlider();
    initScanEffect();
    initPromptBuilders();
    updateUI();
});

// ========================================
// 导航系统
// ========================================
function initNavigation() {
    const navDots = document.getElementById('navDots');
    
    // 创建导航点
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        navDots.appendChild(dot);
    }
}

function updateUI() {
    // 更新幻灯片位置
    const wrapper = document.getElementById('slidesWrapper');
    wrapper.style.transform = `translateX(-${currentSlide * 100}vw)`;
    
    // 更新导航点
    document.querySelectorAll('.nav-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // 更新进度条
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // 更新页码
    document.getElementById('pageCounter').textContent = `${currentSlide + 1} / ${totalSlides}`;
    
    // 更新按钮状态
    document.getElementById('prevBtn').disabled = currentSlide === 0;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
    
    // 触发当前幻灯片的动画
    triggerSlideAnimation(currentSlide);
}

function nextSlide() {
    if (currentSlide < totalSlides - 1 && !isAnimating) {
        currentSlide++;
        updateUI();
    }
}

function prevSlide() {
    if (currentSlide > 0 && !isAnimating) {
        currentSlide--;
        updateUI();
    }
}

function goToSlide(index) {
    if (index >= 0 && index < totalSlides && !isAnimating) {
        currentSlide = index;
        updateUI();
    }
}

// ========================================
// 键盘控制
// ========================================
function initKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
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
        }
    });
}

// ========================================
// 触摸控制
// ========================================
function initTouchControls() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}

// ========================================
// 粒子背景动画
// ========================================
function initParticles() {
    const canvases = ['particleCanvas', 'particleCanvas2'];
    
    canvases.forEach(id => {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        function createParticles() {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / 15000);
            
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 3 + 1,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(79, 70, 229, ${p.opacity})`;
                ctx.fill();
            });
            
            // 连接临近粒子
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(79, 70, 229, ${0.1 * (1 - dist / 100)})`;
                        ctx.stroke();
                    }
                });
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
        resize();
        createParticles();
        animate();
        
        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });
    });
}

// ========================================
// 框架流程动画
// ========================================
const brokeData = {
    B: { title: 'Background - 背景', description: '阐述任务背景，为AI提供充足信息', example: '示例：安居乐寓是深圳领先的长租公寓品牌...' },
    R: { title: 'Role - 角色', description: '设定AI扮演的角色', example: '示例：你是一位经验丰富的公寓管家...' },
    O: { title: 'Objectives - 目标', description: '明确任务目标', example: '示例：为南山科技园工作的客户推荐合适房源' },
    K: { title: 'Key Result - 关键结果', description: '定义成功的标准和输出格式', example: '示例：推荐3套房源，每套包含价格、面积、交通信息' },
    E: { title: 'Evolve - 演变', description: '根据反馈进行优化', example: '示例：如果客户预算有限，优先推荐性价比高的房源' }
};

const costarData = {
    C: { title: 'Context - 背景', description: '提供任务的宏观背景', example: '示例：安居乐寓西乡店新推出一批精装修公寓...' },
    O: { title: 'Objective - 目标', description: '明确具体任务', example: '示例：写一段吸引目标客户的房源介绍文案' },
    S: { title: 'Style - 风格', description: '指定写作风格', example: '示例：现代、简洁、有温度，避免过于商业化' },
    T: { title: 'Tone - 语气', description: '设定情感基调', example: '示例：亲切友好，像朋友推荐一样自然' },
    A: { title: 'Audience - 受众', description: '明确目标读者', example: '示例：25-30岁、在南山或宝安工作的年轻白领' },
    R: { title: 'Response - 响应格式', description: '定义输出格式', example: '示例：标题（不超过15字）+ 正文（150-200字）+ 3个核心卖点 + 行动号召语' }
};

function initFrameworkAnimations() {
    // BROKE框架节点点击
    document.querySelectorAll('#brokeFlow .flow-node').forEach(node => {
        node.addEventListener('click', () => {
            const key = node.getAttribute('data-node');
            const data = brokeData[key];
            if (data) {
                document.getElementById('brokeDetail').innerHTML = `
                    <h3 class="font-display text-subtitle mb-2" style="color: var(--primary);">${data.title}</h3>
                    <p class="text-body mb-2">${data.description}</p>
                    <p class="text-small" style="color: var(--text-muted);">${data.example}</p>
                `;
            }
        });
    });
    
    // CO-STAR框架节点点击
    document.querySelectorAll('#costarFlow .flow-node').forEach(node => {
        node.addEventListener('click', () => {
            const key = node.getAttribute('data-node');
            const data = costarData[key];
            if (data) {
                document.getElementById('costarDetail').innerHTML = `
                    <h3 class="font-display text-subtitle mb-2" style="color: var(--secondary);">${data.title}</h3>
                    <p class="text-body mb-2">${data.description}</p>
                    <p class="text-small" style="color: var(--text-muted);">${data.example}</p>
                `;
            }
        });
    });
}

// ========================================
// 打字机效果
// ========================================
const brokeExampleText = `【Background/背景】
安居乐寓是深圳领先的长租公寓品牌，主要面向22-35岁的年轻用户。
目前西乡店有10套空置房源，需要尽快出租。

【Role/角色】
你是一位经验丰富的公寓管家，擅长根据客户需求精准推荐房源。

【Objectives/目标】
为一位在南山科技园工作的客户推荐合适的房源。

【Key Result/关键结果】
请推荐3套最匹配的房源，每套包含：
1. 房源名称和户型
2. 月租金价格
3. 通勤时间（到南山科技园）
4. 3个核心卖点

【Evolve/演变】
- 如果客户预算有限，优先推荐性价比高的房源
- 如果客户注重生活品质，优先推荐装修较好的房源`;

const costarExampleText = `【Context/背景】
安居乐寓西乡店新推出一批精装修公寓，需要制作宣传文案。

【Objective/目标】
写一段吸引目标客户的房源介绍文案。

【Style/风格】
现代、简洁、有温度，避免过于商业化。

【Tone/语气】
亲切友好，像朋友推荐一样自然。

【Audience/受众】
25-30岁、在南山或宝安工作的年轻白领，注重生活品质但预算有限。

【Response/响应格式】
- 标题（不超过15字）
- 正文（150-200字）
- 3个核心卖点（每点不超过10字）
- 行动号召语`;

function initTypewriterEffects() {
    // 预填充内容，不需要实时打字效果以免影响用户体验
    const brokeEl = document.getElementById('brokeExample');
    const costarEl = document.getElementById('costarExample');
    
    if (brokeEl) brokeEl.textContent = brokeExampleText;
    if (costarEl) costarEl.textContent = costarExampleText;
}

// ========================================
// 滑动对比器
// ========================================
function initSlider() {
    const handle = document.getElementById('sliderHandle');
    const afterPanel = document.getElementById('afterPanel');
    const afterPanelWrapper = document.getElementById('afterPanelWrapper');
    const beforePanel = document.querySelector('.before-panel');
    
    if (!handle || !afterPanel) return;
    
    let isDragging = false;
    
    function updateSlider(percentage) {
        handle.style.left = `${percentage}%`;
        afterPanel.style.width = `${100 - percentage}%`;
        afterPanelWrapper.style.transform = `translateX(-${percentage}%)`;
        
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
    
    handle.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const container = handle.parentElement;
        const rect = container.getBoundingClientRect();
        const percentage = ((e.clientX - rect.left) / rect.width) * 100;
        updateSlider(Math.max(0, Math.min(100, percentage)));
    });
    
    // 触摸支持
    handle.addEventListener('touchstart', () => isDragging = true, { passive: true });
    document.addEventListener('touchend', () => isDragging = false, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const container = handle.parentElement;
        const rect = container.getBoundingClientRect();
        const percentage = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        updateSlider(Math.max(0, Math.min(100, percentage)));
    }, { passive: true });
}

// ========================================
// 高亮扫描效果
// ========================================
function initScanEffect() {
    const scanLine = document.getElementById('scanLine');
    const scanItems = document.querySelectorAll('.scan-item');
    
    if (!scanLine || scanItems.length === 0) return;
    
    let currentLine = 0;
    
    function scan() {
        scanItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentLine);
        });
        
        if (scanItems[currentLine]) {
            const item = scanItems[currentLine];
            const rect = item.getBoundingClientRect();
            const parentRect = item.parentElement.getBoundingClientRect();
            scanLine.style.top = `${rect.top - parentRect.top}px`;
        }
        
        currentLine = (currentLine + 1) % scanItems.length;
    }
    
    // 每2秒扫描一次
    setInterval(scan, 2000);
    scan();
}

// ========================================
// 标签页切换
// ========================================
function showTab(tabId) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有按钮激活状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(tabId).classList.add('active');
    
    // 激活对应按钮
    event.target.classList.add('active');
}

// ========================================
// 手风琴折叠
// ========================================
function toggleAccordion(header) {
    const item = header.parentElement;
    const isOpen = item.classList.contains('open');
    
    // 关闭所有项
    document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
    });
    
    // 如果当前项未打开，则打开它
    if (!isOpen) {
        item.classList.add('open');
    }
}

// ========================================
// 翻转卡片
// ========================================
function flipCard(card) {
    card.classList.toggle('flipped');
}

// ========================================
// Prompt构建器
// ========================================
const brokeTemplates = {
    background: { title: '【Background/背景】', placeholder: '描述任务背景...', content: '安居乐寓是深圳领先的长租公寓品牌，主要面向22-35岁的年轻用户。' },
    role: { title: '【Role/角色】', placeholder: '设定AI角色...', content: '你是一位经验丰富的公寓管家，擅长根据客户需求精准推荐房源。' },
    objectives: { title: '【Objectives/目标】', placeholder: '明确任务目标...', content: '为一位在南山科技园工作的客户推荐合适的房源。' },
    keyresult: { title: '【Key Result/关键结果】', placeholder: '定义成功标准...', content: '推荐3套最匹配的房源，每套包含房源名称、价格、通勤时间、3个核心卖点。' },
    evolve: { title: '【Evolve/演变】', placeholder: '优化策略...', content: '如果客户预算有限，优先推荐性价比高的房源；如果客户注重生活品质，优先推荐装修较好的房源。' }
};

const costarTemplates = {
    context: { title: '【Context/背景】', placeholder: '描述背景...', content: '客户正在通过AI助手咨询安居乐寓的租房服务。' },
    objective: { title: '【Objective/目标】', placeholder: '明确目标...', content: '以专业销售顾问的身份，帮助客户找到满意的房源。' },
    style: { title: '【Style/风格】', placeholder: '指定风格...', content: '专业但不生硬，热情但不夸张，像朋友推荐一样自然。' },
    tone: { title: '【Tone/语气】', placeholder: '设定语气...', content: '友好、耐心、积极，使用emoji增加亲和力。' },
    audience: { title: '【Audience/受众】', placeholder: '明确受众...', content: '25-35岁的年轻白领，可能是第一次租房，对深圳不熟悉。' },
    response: { title: '【Response/响应格式】', placeholder: '定义格式...', content: '1. 问候语（简短友好）\n2. 需求确认（复述客户要求）\n3. 房源推荐（3-5套，含关键信息）\n4. 行动号召（引导下一步）' }
};

let brokeBuildItems = [];
let costarBuildItems = [];

function initPromptBuilders() {
    // 初始化BROKE构建器
    Object.keys(brokeTemplates).forEach(key => {
        addBrokeComponent(key);
    });
    
    // 初始化CO-STAR构建器
    Object.keys(costarTemplates).forEach(key => {
        addCostarComponent(key);
    });
}

function addBrokeComponent(type) {
    const template = brokeTemplates[type];
    if (!template) return;
    
    // 检查是否已存在
    if (brokeBuildItems.some(item => item.type === type)) return;
    
    brokeBuildItems.push({
        id: Date.now() + Math.random(),
        type,
        title: template.title,
        content: template.content
    });
    
    renderBrokeBuildArea();
    updateBrokePreview();
}

function renderBrokeBuildArea() {
    const area = document.getElementById('brokeBuildArea');
    if (!area) return;
    
    if (brokeBuildItems.length === 0) {
        area.innerHTML = '<p class="text-body text-center" style="color: var(--text-muted);">点击上方按钮添加组件</p>';
        return;
    }
    
    area.innerHTML = brokeBuildItems.map(item => `
        <div class="build-item">
            <strong style="color: var(--primary);">${item.title}</strong>
            <textarea oninput="updateBrokeItem('${item.id}', this.value)" placeholder="${brokeTemplates[item.type].placeholder}">${item.content}</textarea>
        </div>
    `).join('');
}

function updateBrokeItem(id, content) {
    const item = brokeBuildItems.find(i => i.id == id);
    if (item) {
        item.content = content;
        updateBrokePreview();
    }
}

function updateBrokePreview() {
    const preview = document.getElementById('brokePreview');
    if (!preview) return;
    
    if (brokeBuildItems.length === 0) {
        preview.textContent = '// 点击左侧组件开始构建...';
        return;
    }
    
    const promptText = brokeBuildItems.map(item => 
        `${item.title}\n${item.content || '// 在此输入内容...'}`
    ).join('\n\n');
    
    preview.textContent = promptText;
}

function copyBrokePrompt() {
    const preview = document.getElementById('brokePreview');
    if (preview) {
        navigator.clipboard.writeText(preview.textContent).then(() => {
            alert('提示词已复制到剪贴板！');
        });
    }
}

function addCostarComponent(type) {
    const template = costarTemplates[type];
    if (!template) return;
    
    // 检查是否已存在
    if (costarBuildItems.some(item => item.type === type)) return;
    
    costarBuildItems.push({
        id: Date.now() + Math.random(),
        type,
        title: template.title,
        content: template.content
    });
    
    renderCostarBuildArea();
    updateCostarPreview();
}

function renderCostarBuildArea() {
    const area = document.getElementById('costarBuildArea');
    if (!area) return;
    
    if (costarBuildItems.length === 0) {
        area.innerHTML = '<p class="text-body text-center" style="color: var(--text-muted);">点击上方按钮添加组件</p>';
        return;
    }
    
    area.innerHTML = costarBuildItems.map(item => `
        <div class="build-item">
            <strong style="color: var(--secondary);">${item.title}</strong>
            <textarea oninput="updateCostarItem('${item.id}', this.value)" placeholder="${costarTemplates[item.type].placeholder}">${item.content}</textarea>
        </div>
    `).join('');
}

function updateCostarItem(id, content) {
    const item = costarBuildItems.find(i => i.id == id);
    if (item) {
        item.content = content;
        updateCostarPreview();
    }
}

function updateCostarPreview() {
    const preview = document.getElementById('costarPreview');
    if (!preview) return;
    
    if (costarBuildItems.length === 0) {
        preview.textContent = '// 点击左侧组件开始构建...';
        return;
    }
    
    const promptText = costarBuildItems.map(item => 
        `${item.title}\n${item.content || '// 在此输入内容...'}`
    ).join('\n\n');
    
    preview.textContent = promptText;
}

function copyCostarPrompt() {
    const preview = document.getElementById('costarPreview');
    if (preview) {
        navigator.clipboard.writeText(preview.textContent).then(() => {
            alert('提示词已复制到剪贴板！');
        });
    }
}

// ========================================
// 幻灯片特定动画
// ========================================
function triggerSlideAnimation(slideIndex) {
    const slide = document.querySelector(`[data-index="${slideIndex}"]`);
    if (!slide) return;
    
    // 使用GSAP进行入场动画
    const elements = slide.querySelectorAll('.clay-card, .bento-item, .framework-flow, .typewriter-container, .tabs-container, .accordion, .flip-card');
    
    gsap.fromTo(elements, 
        { opacity: 0, y: 30 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1,
            ease: 'power2.out'
        }
    );
    
    // 框架流程动画
    if (slideIndex === 2) {
        // BROKE框架
        animateFramework('#brokeFlow');
    } else if (slideIndex === 5) {
        // CO-STAR框架
        animateFramework('#costarFlow');
    }
}

function animateFramework(selector) {
    const nodes = document.querySelectorAll(`${selector} .flow-node`);
    const lines = document.querySelectorAll(`${selector} .flow-line`);
    
    nodes.forEach((node, index) => {
        gsap.fromTo(node,
            { opacity: 0, scale: 0 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5, 
                delay: index * 0.3,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    if (index < lines.length) {
                        gsap.to(lines[index], { 
                            strokeDashoffset: 0, 
                            duration: 0.5, 
                            ease: 'power2.out' 
                        });
                    }
                }
            }
        );
    });
}

// ========================================
// 防止空格键滚动页面
// ========================================
window.addEventListener('keydown', function(e) {
    if(e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
    }
});
