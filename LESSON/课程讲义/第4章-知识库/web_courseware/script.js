// 全局状态管理
let currentSlide = 0;
let totalSlides = 0;

/**
 * 初始化幻灯片系统
 */
function initSlides() {
    const slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    document.getElementById('totalSlides').textContent = totalSlides;
    
    // 初始位置显示
    updateSlideDisplay();
    
    // 监听键盘事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });
}

/**
 * 更新幻灯片显示效果（包含 GSAP 动画）
 */
function updateSlideDisplay() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            // 当前幻灯片进入动画
            slide.classList.add('active');
            gsap.fromTo(slide.querySelector('.slide-content'), 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
            );
            
            // 如果内部有阶梯式加载元素
            const staggeredElements = slide.querySelectorAll('.clay-card, .list-item');
            if (staggeredElements.length > 0) {
                gsap.fromTo(staggeredElements, 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.3 }
                );
            }
        } else {
            // 非当前幻灯片隐藏
            slide.classList.remove('active');
        }
    });

    // 更新 UI 计数和进度条
    document.getElementById('currentSlide').textContent = currentSlide + 1;
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;

    // 禁用/启用按钮
    document.getElementById('prevBtn').disabled = (currentSlide === 0);
    document.getElementById('nextBtn').disabled = (currentSlide === totalSlides - 1);
}

/**
 * 下一页
 */
function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlideDisplay();
    }
}

/**
 * 上一页
 */
function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlideDisplay();
    }
}

/**
 * PageIndex 树节点显示逻辑 (Slide 10.2)
 */
const treeData = {
    '0001': { title: '2023 财务报告 (根节点)', summary: '包含公司全年度的财务状况。LLM 识别到这是目标文档。' },
    '0002': { title: '1. 执行摘要', summary: '展示了 2023 年整体表现。无具体收入明细。' },
    '0003': { title: '2. 收入分析', summary: '包含各业务线的详细收入。LLM 决定深入此章节。' },
    '0004': { title: '2.1 产品A收入', summary: '具体到产品 A 的收入数据。找到目标内容！' },
    '0005': { title: '2.2 产品B收入', summary: '具体到产品 B 的收入数据。' }
};

function showTreeNode(id) {
    const display = document.getElementById('nodeDisplay');
    const data = treeData[id];
    
    if (data) {
        gsap.to(display, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => {
            display.innerHTML = `
                <div class="clay-card p-6 bg-primary text-white mb-4 shadow-float">
                    <h3 class="font-display font-bold text-2xl">${data.title}</h3>
                    <p class="text-sm opacity-80 mt-2">UUID: ${id}</p>
                </div>
                <div class="p-8 bg-white rounded-2xl shadow-inner border-2 border-primary/10">
                    <p class="text-body text-text font-medium leading-relaxed">${data.summary}</p>
                </div>
            `;
            gsap.to(display, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
        }});
    }
}

// 页面加载完成后启动
document.addEventListener('DOMContentLoaded', initSlides);
