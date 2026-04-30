// 交互式课件 JavaScript

// 幻灯片状态
let currentSlide = 0;
const totalSlides = 27;

// DOM元素
const slidesWrapper = document.getElementById('slidesWrapper');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideIndicator = document.getElementById('slideIndicator');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initSlides();
    initKeyboardNavigation();
    initAnimations();
});

// 初始化幻灯片
function initSlides() {
    updateSlideIndicator();
    updateNavigationButtons();
    initSlideAnimations();
}

// 更新幻灯片指示器
function updateSlideIndicator() {
    slideIndicator.textContent = `${currentSlide + 1} / ${totalSlides}`;
}

// 更新导航按钮状态
function updateNavigationButtons() {
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;
}

// 切换到指定幻灯片
function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    const prevSlideEl = slides[currentSlide];
    const nextSlideEl = slides[index];
    
    // 移除当前幻灯片的活动状态
    prevSlideEl.classList.remove('active');
    
    // 添加方向类
    if (index > currentSlide) {
        prevSlideEl.classList.add('prev');
    }
    
    // 更新当前索引
    currentSlide = index;
    
    // 移除所有幻灯片的方向类
    slides.forEach(slide => slide.classList.remove('prev'));
    
    // 激活新幻灯片
    nextSlideEl.classList.add('active');
    
    // 更新UI
    updateSlideIndicator();
    updateNavigationButtons();
    
    // 触发动画
    triggerSlideAnimations(nextSlideEl);
}

// 下一张幻灯片
function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1);
    }
}

// 上一张幻灯片
function prevSlide() {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
    }
}

// 键盘导航
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'Enter':
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

// 初始化动画
function initAnimations() {
    // 初始化SVG流程图动画
    initFlowAnimations();
}

// 初始化幻灯片动画
function initSlideAnimations() {
    const activeSlide = slides[currentSlide];
    triggerSlideAnimations(activeSlide);
}

// 触发动画
function triggerSlideAnimations(slideEl) {
    // 流程图动画
    const flowNodes = slideEl.querySelectorAll('.flow-node');
    const flowLines = slideEl.querySelectorAll('.flow-line');
    
    flowNodes.forEach((node, index) => {
        gsap.fromTo(node, 
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5, 
                delay: index * 0.1 + 0.3,
                ease: 'back.out(1.7)'
            }
        );
    });
    
    flowLines.forEach((line, index) => {
        gsap.fromTo(line,
            { strokeDashoffset: 200 },
            {
                strokeDashoffset: 0,
                duration: 0.5,
                delay: index * 0.1 + 0.5,
                ease: 'power2.out'
            }
        );
    });
    
    // 能力节点动画
    const abilityNodes = slideEl.querySelectorAll('.ability-node');
    abilityNodes.forEach((node, index) => {
        gsap.fromTo(node,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                delay: index * 0.15 + 0.2,
                ease: 'back.out(1.7)'
            }
        );
    });
    
    // 卡片动画
    const cards = slideEl.querySelectorAll('.bg-card\\/30, .bg-card\\/50');
    cards.forEach((card, index) => {
        gsap.fromTo(card,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                delay: index * 0.05 + 0.2,
                ease: 'power2.out'
            }
        );
    });
}

// 流程图动画初始化
function initFlowAnimations() {
    // 等待DOM完全加载后初始化
    setTimeout(() => {
        const agentCoreFlow = document.getElementById('agentCoreFlow');
        if (agentCoreFlow) {
            const nodes = agentCoreFlow.querySelectorAll('.flow-node');
            const lines = agentCoreFlow.querySelectorAll('.flow-line');
            
            nodes.forEach((node, index) => {
                gsap.fromTo(node,
                    { opacity: 0, scale: 0.5 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        delay: index * 0.2,
                        ease: 'back.out(1.7)'
                    }
                );
                
                node.addEventListener('click', () => {
                    gsap.to(node, {
                        scale: 1.1,
                        duration: 0.2,
                        ease: 'power2.out',
                        onComplete: () => {
                            gsap.to(node, {
                                scale: 1,
                                duration: 0.2,
                                ease: 'power2.inOut'
                            });
                        }
                    });
                });
            });
            
            lines.forEach((line, index) => {
                gsap.fromTo(line,
                    { strokeDashoffset: 200 },
                    {
                        strokeDashoffset: 0,
                        duration: 0.5,
                        delay: index * 0.2 + 0.3,
                        ease: 'power2.out'
                    }
                );
            });
        }
    }, 100);
}

// 导出函数到全局
window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.goToSlide = goToSlide;

// 触摸滑动支持
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

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

// 添加点击事件到导航按钮
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// 页面可见性变化时重新触发动画
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        const activeSlide = slides[currentSlide];
        triggerSlideAnimations(activeSlide);
    }
});

// 窗口大小变化时重新调整
window.addEventListener('resize', function() {
    const activeSlide = slides[currentSlide];
    triggerSlideAnimations(activeSlide);
});
