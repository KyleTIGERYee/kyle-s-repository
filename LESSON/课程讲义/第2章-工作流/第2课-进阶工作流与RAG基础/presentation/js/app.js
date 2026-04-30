let currentSlide = 0;
let totalSlides = 0;
let isAnimating = false;

function init() {
    totalSlides = document.querySelectorAll('.slide').length;
    document.getElementById('totalSlides').textContent = totalSlides;
    
    initDots();
    updateSlideDisplay();
    initParticles();
    initAnimations();
    
    document.addEventListener('keydown', handleKeyboard);
    
    initTouchSupport();
}

function initDots() {
    const dotsContainer = document.getElementById('dotsContainer');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
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
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    document.getElementById('currentSlide').textContent = currentSlide + 1;
    
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    document.getElementById('prevBtn').disabled = currentSlide === 0;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
    
    animateSlideContent();
}

function nextSlide() {
    if (currentSlide < totalSlides - 1 && !isAnimating) {
        currentSlide++;
        updateSlideDisplay();
    }
}

function prevSlide() {
    if (currentSlide > 0 && !isAnimating) {
        currentSlide--;
        updateSlideDisplay();
    }
}

function goToSlide(index) {
    if (index >= 0 && index < totalSlides && !isAnimating) {
        currentSlide = index;
        updateSlideDisplay();
    }
}

function handleKeyboard(e) {
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
}

function initTouchSupport() {
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

function animateSlideContent() {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;
    
    const elements = activeSlide.querySelectorAll('.interactive-box, .text-title, .text-subtitle, .clay-badge, h2, h3, p, table, .grid > div');
    
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
    
    initSlideSpecificAnimations(activeSlide);
}

function initSlideSpecificAnimations(slide) {
    const index = parseInt(slide.getAttribute('data-index'));
    
    if (index === 1) {
        animateFactoryFlow();
    } else if (index === 5) {
        animateDAG();
    } else if (index === 9) {
        animateRAGFlow();
    }
}

function animateFactoryFlow() {
    const nodes = document.querySelectorAll('.factory-node');
    const lines = document.querySelectorAll('.flow-arrow');
    
    if (typeof gsap !== 'undefined') {
        nodes.forEach((node, index) => {
            gsap.fromTo(node, 
                { opacity: 0, scale: 0.8 },
                { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.5, 
                    delay: index * 0.2,
                    ease: 'back.out(1.7)'
                }
            );
        });
        
        lines.forEach((line, index) => {
            gsap.to(line, {
                strokeDashoffset: 0,
                duration: 0.5,
                delay: (index + 1) * 0.2,
                ease: 'power2.out'
            });
        });
    }
}

function animateDAG() {
    const nodes = document.querySelectorAll('.dag-node');
    const lines = document.querySelectorAll('.dag-line');
    
    if (typeof gsap !== 'undefined') {
        nodes.forEach((node, index) => {
            gsap.fromTo(node, 
                { opacity: 0, scale: 0.8 },
                { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.5, 
                    delay: index * 0.15,
                    ease: 'back.out(1.7)'
                }
            );
        });
        
        lines.forEach((line, index) => {
            gsap.to(line, {
                strokeDashoffset: 0,
                duration: 0.4,
                delay: (index + 1) * 0.15,
                ease: 'power2.out'
            });
        });
    }
}

function animateRAGFlow() {
    const nodes = document.querySelectorAll('.rag-node');
    
    if (typeof gsap !== 'undefined') {
        nodes.forEach((node, index) => {
            gsap.fromTo(node, 
                { opacity: 0, x: -30 },
                { 
                    opacity: 1, 
                    x: 0, 
                    duration: 0.5, 
                    delay: index * 0.2,
                    ease: 'power2.out'
                }
            );
        });
    }
}

function initAnimations() {
    if (typeof gsap !== 'undefined') {
        gsap.from('.clay-badge', {
            opacity: 0,
            y: -20,
            duration: 0.6,
            ease: 'back.out(1.7)'
        });
    }
}

function toggleAccordion(button) {
    const item = button.parentElement;
    const content = button.nextElementSibling;
    const icon = button.querySelector('.accordion-icon');
    
    document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.accordion-content');
            if (otherContent) {
                otherContent.classList.add('hidden');
                otherContent.classList.remove('show');
            }
            const otherIcon = otherItem.querySelector('.accordion-icon');
            if (otherIcon) otherIcon.textContent = '+';
        }
    });
    
    item.classList.toggle('active');
    
    if (item.classList.contains('active')) {
        content.classList.remove('hidden');
        content.classList.add('show');
        if (icon) icon.textContent = '-';
    } else {
        content.classList.add('hidden');
        content.classList.remove('show');
        if (icon) icon.textContent = '+';
    }
}

function showConfigTab(tabId) {
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-gray-100', 'text-text-secondary');
    });
    
    const targetPanel = document.getElementById(tabId + 'Config');
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
    }
    
    event.target.classList.add('active');
    event.target.classList.remove('bg-gray-100', 'text-text-secondary');
    event.target.classList.add('bg-primary', 'text-white');
}

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
