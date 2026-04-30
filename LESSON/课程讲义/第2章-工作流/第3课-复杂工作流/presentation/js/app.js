const CourseState = {
    currentSlide: 0,
    totalSlides: 18,
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
    initButtons();
    updateDisplay();
    initParticles();
    initKeyboardNav();
    initTouchNav();
    animateSlideContent(slides[0]);
}

function initButtons() {
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
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
    
    const elements = slide.querySelectorAll('.interactive-box, .text-title, .text-subtitle, .clay-badge, h2, h3, p, table, .grid > div, .intent-card, .code-block, svg *');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(elements, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.05,
                ease: 'power3.out'
            }
        );
    }
    
    const slideIndex = parseInt(slide.getAttribute('data-index'));
    if (slideIndex === 2) {
        initCoreContentAnimation();
    } else if (slideIndex === 3) {
        initIntentCardsAnimation();
    } else if (slideIndex === 5) {
        initFlowChartAnimation();
    } else if (slideIndex === 6) {
        initTableAnimation();
    }
}

function initCoreContentAnimation() {
    const cards = document.querySelectorAll('.grid .interactive-box');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(cards, 
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5, 
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }
        );
    }
}

function initIntentCardsAnimation() {
    const cards = document.querySelectorAll('.intent-card');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(cards, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.5, 
                stagger: 0.1,
                ease: 'power3.out'
            }
        );
    }
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
        card.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    });
}

function initFlowChartAnimation() {
    const nodes = document.querySelectorAll('.brain-node, .branch-node, .api-node, .result-node, .recovery-node');
    const paths = document.querySelectorAll('path[stroke]');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(nodes, 
            { opacity: 0, scale: 0.5 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.4, 
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }
        );
        
        setTimeout(() => {
            paths.forEach((path, index) => {
                const length = path.getTotalLength ? path.getTotalLength() : 200;
                gsap.fromTo(path,
                    { strokeDasharray: length, strokeDashoffset: length },
                    { 
                        strokeDashoffset: 0, 
                        duration: 0.5,
                        delay: index * 0.02,
                        ease: 'power2.out'
                    }
                );
            });
        }, 400);
    }
}

function initTableAnimation() {
    const rows = document.querySelectorAll('tbody tr');
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(rows, 
            { opacity: 0, x: -30 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 0.4, 
                stagger: 0.15,
                ease: 'power3.out'
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

document.addEventListener('DOMContentLoaded', init);
