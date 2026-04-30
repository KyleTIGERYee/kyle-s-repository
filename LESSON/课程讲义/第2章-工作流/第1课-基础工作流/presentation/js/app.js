const CourseState = {
    currentSlide: 0,
    totalSlides: 19,
    isAnimating: false
};

const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dotsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentSlideEl = document.getElementById('currentSlide');
const totalSlidesEl = document.getElementById('totalSlides');
const progressBar = document.getElementById('progressBar');

function init() {
    totalSlidesEl.textContent = CourseState.totalSlides;
    initDots();
    updateDisplay();
    initParticles();
    initKeyboardNav();
    initTouchNav();
    animateSlideContent(slides[0]);
}

function initDots() {
    for (let i = 0; i < CourseState.totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
}

function updateDisplay() {
    const dots = document.querySelectorAll('.slide-dot');
    
    slides.forEach((slide, index) => {
        if (index === CourseState.currentSlide) {
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
        dot.classList.toggle('active', index === CourseState.currentSlide);
    });
    
    currentSlideEl.textContent = CourseState.currentSlide + 1;
    
    const progress = ((CourseState.currentSlide + 1) / CourseState.totalSlides) * 100;
    progressBar.style.width = `${progress}%`;
    
    prevBtn.disabled = CourseState.currentSlide === 0;
    nextBtn.disabled = CourseState.currentSlide === CourseState.totalSlides - 1;
}

function nextSlide() {
    if (CourseState.currentSlide < CourseState.totalSlides - 1 && !CourseState.isAnimating) {
        goToSlide(CourseState.currentSlide + 1);
    }
}

function prevSlide() {
    if (CourseState.currentSlide > 0 && !CourseState.isAnimating) {
        goToSlide(CourseState.currentSlide - 1);
    }
}

function goToSlide(index) {
    if (index < 0 || index >= CourseState.totalSlides || CourseState.isAnimating) return;
    
    CourseState.isAnimating = true;
    
    const currentSlideEl = slides[CourseState.currentSlide];
    const nextSlideEl = slides[index];
    
    if (typeof gsap !== 'undefined') {
        gsap.to(currentSlideEl, {
            opacity: 0,
            duration: 0.3,
            ease: 'power3.in'
        });
        
        setTimeout(() => {
            currentSlideEl.style.display = 'none';
            currentSlideEl.style.opacity = '0';
            
            CourseState.currentSlide = index;
            
            nextSlideEl.style.display = 'block';
            nextSlideEl.style.opacity = '0';
            
            gsap.to(nextSlideEl, {
                opacity: 1,
                duration: 0.3,
                ease: 'power3.out',
                onComplete: () => {
                    CourseState.isAnimating = false;
                    animateSlideContent(nextSlideEl);
                }
            });
            
            updateDisplay();
        }, 300);
    } else {
        CourseState.currentSlide = index;
        updateDisplay();
        CourseState.isAnimating = false;
    }
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
    
    const slideIndex = parseInt(slide.getAttribute('data-index'));
    if (slideIndex === 1) {
        initFactoryAnimation();
    } else if (slideIndex === 3) {
        initPillarsAnimation();
    } else if (slideIndex === 5) {
        initDAGAnimation();
    }
}

function initFactoryAnimation() {
    const nodes = document.querySelectorAll('.factory-node');
    const arrows = document.querySelectorAll('.flow-arrow');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(nodes, 
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5, 
                stagger: 0.2,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    arrows.forEach((arrow, index) => {
                        gsap.to(arrow, {
                            strokeDashoffset: 0,
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: 'power2.out'
                        });
                    });
                }
            }
        );
    }
}

function initPillarsAnimation() {
    const layers = document.querySelectorAll('.pillar-layer');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(layers, 
            { opacity: 0, x: -50 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 0.6, 
                stagger: 0.15,
                ease: 'power3.out'
            }
        );
    }
}

function initDAGAnimation() {
    const nodes = document.querySelectorAll('.dag-node');
    const lines = document.querySelectorAll('.dag-line');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(nodes, 
            { opacity: 0, scale: 0.5 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.4, 
                stagger: 0.15,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    lines.forEach((line, index) => {
                        gsap.to(line, {
                            strokeDashoffset: 0,
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: 'power2.out'
                        });
                    });
                }
            }
        );
    }
}

function initKeyboardNav() {
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
                goToSlide(CourseState.totalSlides - 1);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
        }
    });
}

function initTouchNav() {
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
}

function toggleFullscreen() {
    const presentation = document.getElementById('presentation');
    
    if (!document.fullscreenElement) {
        if (presentation.requestFullscreen) {
            presentation.requestFullscreen();
        } else if (presentation.webkitRequestFullscreen) {
            presentation.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

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

function showNodeTab(tabName) {
    const tabs = ['input', 'llm', 'variable'];
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        const tabEl = document.getElementById(`${tab}Tab`);
        if (tabEl) {
            tabEl.classList.toggle('hidden', tab !== tabName);
        }
    });
    
    tabBtns.forEach((btn, index) => {
        if (tabs[index] === tabName) {
            btn.classList.add('active');
            btn.classList.remove('bg-gray-100', 'text-text-secondary');
            btn.classList.add('bg-primary', 'text-white');
        } else {
            btn.classList.remove('active');
            btn.classList.add('bg-gray-100', 'text-text-secondary');
            btn.classList.remove('bg-primary', 'text-white');
        }
    });
}

function toggleAccordion(button) {
    const item = button.parentElement;
    const content = button.nextElementSibling;
    const icon = button.querySelector('.accordion-icon');
    
    const allItems = document.querySelectorAll('.accordion-item');
    allItems.forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.accordion-content');
            const otherIcon = otherItem.querySelector('.accordion-icon');
            if (otherContent) {
                otherContent.classList.add('hidden');
                otherContent.classList.remove('show');
            }
            if (otherIcon) {
                otherIcon.textContent = '+';
            }
        }
    });
    
    item.classList.toggle('active');
    
    if (item.classList.contains('active')) {
        content.classList.remove('hidden');
        content.classList.add('show');
        icon.textContent = '−';
    } else {
        content.classList.add('hidden');
        content.classList.remove('show');
        icon.textContent = '+';
    }
}

const nodeDetails = {
    input: {
        title: '输入节点 (Start/Input)',
        content: `
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h4 class="font-display text-lg font-semibold text-green-500 mb-3">功能</h4>
                    <p class="text-body text-text-secondary">接收用户输入或外部数据，作为工作流的起点。</p>
                </div>
                <div>
                    <h4 class="font-display text-lg font-semibold text-primary mb-3">配置项</h4>
                    <ul class="text-body text-text-secondary space-y-1">
                        <li>• 输入参数定义（名称、类型、默认值）</li>
                        <li>• 参数校验规则</li>
                        <li>• 输入提示信息</li>
                    </ul>
                </div>
            </div>
        `
    },
    llm: {
        title: 'LLM节点 (大模型节点)',
        content: `
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h4 class="font-display text-lg font-semibold text-primary mb-3">功能</h4>
                    <p class="text-body text-text-secondary">调用大语言模型进行推理和生成。</p>
                </div>
                <div>
                    <h4 class="font-display text-lg font-semibold text-primary mb-3">配置项</h4>
                    <ul class="text-body text-text-secondary space-y-1">
                        <li>• 选择模型（GPT-4、Claude等）</li>
                        <li>• 设置提示词（Prompt）</li>
                        <li>• 配置Temperature等参数</li>
                        <li>• 定义输出格式（结构化输出）</li>
                    </ul>
                </div>
            </div>
        `
    },
    variable: {
        title: '变量节点 (Variable/Assigner)',
        content: `
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h4 class="font-display text-lg font-semibold text-purple-500 mb-3">功能</h4>
                    <p class="text-body text-text-secondary">存储和传递中间结果，在工作流中传递数据。</p>
                </div>
                <div>
                    <h4 class="font-display text-lg font-semibold text-primary mb-3">使用场景</h4>
                    <ul class="text-body text-text-secondary space-y-1">
                        <li>• 保存LLM的输出结果</li>
                        <li>• 在不同节点间传递数据</li>
                        <li>• 临时存储计算结果</li>
                    </ul>
                </div>
            </div>
        `
    },
    condition: {
        title: '条件判断节点 (Condition/If-Else)',
        content: `
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h4 class="font-display text-lg font-semibold text-yellow-500 mb-3">功能</h4>
                    <p class="text-body text-text-secondary">实现分支逻辑，根据条件决定执行路径。</p>
                </div>
                <div>
                    <h4 class="font-display text-lg font-semibold text-primary mb-3">配置项</h4>
                    <ul class="text-body text-text-secondary space-y-1">
                        <li>• 条件表达式</li>
                        <li>• True分支</li>
                        <li>• False分支</li>
                    </ul>
                </div>
            </div>
        `
    },
    output: {
        title: '输出节点 (End/Output)',
        content: `
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <h4 class="font-display text-lg font-semibold text-red-500 mb-3">功能</h4>
                    <p class="text-body text-text-secondary">返回工作流执行结果。</p>
                </div>
                <div>
                    <h4 class="font-display text-lg font-semibold text-primary mb-3">输出模式</h4>
                    <ul class="text-body text-text-secondary space-y-1">
                        <li>• 模式一：返回变量</li>
                        <li>• 模式二：直接输出</li>
                    </ul>
                </div>
            </div>
        `
    }
};

function showNodeDetail(nodeType) {
    const panel = document.getElementById('nodeDetailPanel');
    const content = document.getElementById('nodeDetailContent');
    const detail = nodeDetails[nodeType];
    
    if (detail && panel && content) {
        content.innerHTML = `
            <h3 class="font-display text-xl font-semibold text-primary mb-4">${detail.title}</h3>
            ${detail.content}
        `;
        panel.classList.remove('hidden');
        
        if (typeof gsap !== 'undefined') {
            gsap.from(panel, { opacity: 0, y: 20, duration: 0.3 });
        }
    }
}

const pillarDetails = {
    workflow: 'Workflow层负责流程编排和节点执行，适用于简历筛选、数据录入、审批流程等场景。',
    rag: 'RAG层负责知识检索和上下文增强，适用于智能客服、知识库问答等场景。',
    agent: 'Agent层负责自主决策和工具调用，适用于复杂任务执行、多步骤规划等场景。'
};

function showPillarDetail(pillar) {
    console.log(pillarDetails[pillar]);
}

document.addEventListener('DOMContentLoaded', init);