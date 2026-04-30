// Global State
let currentSlide = 0;
let totalSlides = 0;

/**
 * Slide Navigation System
 */
function initSlides() {
    const slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    document.getElementById('totalSlides').textContent = totalSlides;
    
    updateSlideDisplay();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });
}

function updateSlideDisplay() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
            // GSAP Entry
            gsap.fromTo(slide.querySelector('.slide-content'), 
                { opacity: 0, scale: 0.98, y: 40 }, 
                { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.4)" }
            );
            
            // Stagger Internal Cards
            const items = slide.querySelectorAll('.clay-card, .flip-card, .matrix-table tr, .step-node');
            if (items.length > 0) {
                gsap.fromTo(items, 
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.4 }
                );
            }
        } else {
            slide.classList.remove('active');
        }
    });

    document.getElementById('currentSlide').textContent = currentSlide + 1;
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    document.getElementById('prevBtn').disabled = (currentSlide === 0);
    document.getElementById('nextBtn').disabled = (currentSlide === totalSlides - 1);
}

function nextSlide() { if (currentSlide < totalSlides - 1) { currentSlide++; updateSlideDisplay(); } }
function prevSlide() { if (currentSlide > 0) { currentSlide--; updateSlideDisplay(); } }

/**
 * Slide 3: Token Calculator
 */
function updateTokenCalc() {
    const input = document.getElementById('tokenInput');
    const display = document.getElementById('tokenResult');
    if (!input || !display) return;
    
    const text = input.value;
    // Simple heuristic: 1 English word ~ 1 token, 1 Chinese char ~ 1.5 tokens
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = text.replace(/[\u4e00-\u9fa5]/g, '').trim().split(/\s+/).filter(w => w).length;
    
    const count = Math.ceil(chineseChars * 1.5 + englishWords);
    
    gsap.to(display, {
        innerText: count,
        duration: 0.5,
        snap: { innerText: 1 },
        ease: "power2.out"
    });
}

/**
 * Slide 4: Temperature Simulation
 */
function updateTempSim(val) {
    const label = document.getElementById('tempVal');
    const container = document.getElementById('tempOutputContainer');
    if (!label || !container) return;
    
    label.textContent = val;
    
    const outputs = {
        '0': '推荐结果：金港豪庭（确定性最高，唯一回答）',
        '0.7': '推荐结果：金港豪庭，或者您也可以考虑深蓝广场（具备多样性）',
        '1': '推荐结果：也许您可以住在公园里的长椅上？或者金港豪庭？（随机性过高，可能产生幻觉）'
    };
    
    let key = '0.7';
    if (val < 0.3) key = '0';
    else if (val > 0.8) key = '1';
    
    gsap.to(container, { opacity: 0, x: -10, duration: 0.2, onComplete: () => {
        container.textContent = outputs[key];
        gsap.to(container, { opacity: 1, x: 0, duration: 0.4 });
    }});
}

/**
 * Slide 12: RAG Flow Control
 */
function showRAGStep(step) {
    const steps = document.querySelectorAll('.rag-step-box');
    steps.forEach((box, i) => {
        if (i < step) {
            box.classList.add('bg-primary', 'text-white');
            box.classList.remove('bg-white', 'text-text');
        } else {
            box.classList.remove('bg-primary', 'text-white');
            box.classList.add('bg-white', 'text-text');
        }
    });
}

/**
 * Slide 20: Case Study Step (Enhanced)
 */
function showCaseStep(step, caseId) {
    const container = document.getElementById(caseId);
    if (!container) return;
    
    const nodes = container.querySelectorAll('.step-node');
    const codes = container.querySelectorAll('.step-code-content');
    
    nodes.forEach((node, i) => {
        if (i < step) node.classList.add('active');
        else node.classList.remove('active');
    });

    codes.forEach((code, i) => {
        if (i === step - 1) {
            code.classList.remove('hidden');
            gsap.fromTo(code, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
        } else {
            code.classList.add('hidden');
        }
    });
}

/**
 * Slide 21: Flip Wall PITFALLS
 */
function initPitfallWall() {
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

// Lifecycle
document.addEventListener('DOMContentLoaded', () => {
    initSlides();
    initPitfallWall();
});
