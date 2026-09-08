// ══════════════════════════════════════════════════
// PORTFOLIO — Three.js + GSAP Engine
// ══════════════════════════════════════════════════

const THREE = window.THREE;

// ── GSAP Setup ──
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// ══════════════════════════════════════════════════
// THREE.JS — Particle Network Scene
// ══════════════════════════════════════════════════

class ParticleNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);
        this.clock = new THREE.Clock();
        this.particleCount = window.innerWidth < 768 ? 60 : 120;
        this.connectionDistance = window.innerWidth < 768 ? 1.8 : 2.2;

        this.init();
        this.createParticles();
        this.createConnections();
        this.setupEvents();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    getAccentColor() {
        const isDark = document.documentElement.classList.contains('dark');
        return isDark ? 0x7c3aed : 0x6d28d9;
    }

    getSecondaryColor() {
        const isDark = document.documentElement.classList.contains('dark');
        return isDark ? 0x3b82f6 : 0x2563eb;
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = [];
        const spread = 8;

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;

            velocities.push({
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.002
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.velocities = velocities;

        const material = new THREE.PointsMaterial({
            color: this.getAccentColor(),
            size: 0.04,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createConnections() {
        const lineGeometry = new THREE.BufferGeometry();
        const maxConnections = this.particleCount * 6;
        const linePositions = new Float32Array(maxConnections * 3);
        const lineColors = new Float32Array(maxConnections * 3);

        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
    }

    updateConnections() {
        const positions = this.particles.geometry.attributes.position.array;
        const linePositions = this.lines.geometry.attributes.position.array;
        const lineColors = this.lines.geometry.attributes.color.array;
        let lineIndex = 0;

        const accentR = 0.486; // #7c3aed
        const accentG = 0.227;
        const accentB = 0.929;
        const blueR = 0.231; // #3b82f6
        const blueG = 0.510;
        const blueB = 0.965;

        for (let i = 0; i < this.particleCount; i++) {
            for (let j = i + 1; j < this.particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < this.connectionDistance && lineIndex < linePositions.length - 6) {
                    const alpha = 1 - dist / this.connectionDistance;
                    const mix = (i + j) % 2 === 0 ? 0 : 1;

                    linePositions[lineIndex] = positions[i * 3];
                    linePositions[lineIndex + 1] = positions[i * 3 + 1];
                    linePositions[lineIndex + 2] = positions[i * 3 + 2];
                    linePositions[lineIndex + 3] = positions[j * 3];
                    linePositions[lineIndex + 4] = positions[j * 3 + 1];
                    linePositions[lineIndex + 5] = positions[j * 3 + 2];

                    const r = mix === 0 ? accentR * alpha : blueR * alpha;
                    const g = mix === 0 ? accentG * alpha : blueG * alpha;
                    const b = mix === 0 ? accentB * alpha : blueB * alpha;

                    lineColors[lineIndex] = r;
                    lineColors[lineIndex + 1] = g;
                    lineColors[lineIndex + 2] = b;
                    lineColors[lineIndex + 3] = r;
                    lineColors[lineIndex + 4] = g;
                    lineColors[lineIndex + 5] = b;

                    lineIndex += 6;
                }
            }
        }

        // Clear remaining
        for (let i = lineIndex; i < linePositions.length; i++) {
            linePositions[i] = 0;
            lineColors[i] = 0;
        }

        this.lines.geometry.attributes.position.needsUpdate = true;
        this.lines.geometry.attributes.color.needsUpdate = true;
        this.lines.geometry.setDrawRange(0, lineIndex / 3);
    }

    setupEvents() {
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateTheme() {
        if (this.particles) {
            this.particles.material.color.set(this.getAccentColor());
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Smooth mouse follow
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Update particle positions
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            positions[i3] += this.velocities[i].x;
            positions[i3 + 1] += this.velocities[i].y;
            positions[i3 + 2] += this.velocities[i].z;

            // Add subtle wave motion
            positions[i3 + 1] += Math.sin(elapsed * 0.5 + i * 0.1) * 0.001;

            // Boundaries - wrap around
            const bound = 4;
            if (positions[i3] > bound) positions[i3] = -bound;
            if (positions[i3] < -bound) positions[i3] = bound;
            if (positions[i3 + 1] > bound) positions[i3 + 1] = -bound;
            if (positions[i3 + 1] < -bound) positions[i3 + 1] = bound;

            // Mouse interaction — gentle push
            const dx = positions[i3] - this.mouse.x * 3;
            const dy = positions[i3 + 1] - this.mouse.y * 3;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 2) {
                const force = (2 - dist) * 0.0008;
                positions[i3] += dx * force;
                positions[i3 + 1] += dy * force;
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;

        // Slow rotation
        this.particles.rotation.y = elapsed * 0.03 + this.mouse.x * 0.1;
        this.particles.rotation.x = this.mouse.y * 0.05;
        this.lines.rotation.y = this.particles.rotation.y;
        this.lines.rotation.x = this.particles.rotation.x;

        this.updateConnections();
        this.renderer.render(this.scene, this.camera);
    }
}

// ══════════════════════════════════════════════════
// GSAP ANIMATIONS
// ══════════════════════════════════════════════════

function initGSAP() {
    // ── Hero Animations (entry) ──
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
        .from('.hero-badge', {
            y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
        })
        .from('.hero-greeting', {
            y: 20, opacity: 0, duration: 0.5, ease: 'power3.out'
        }, '-=0.3')
        .from('.hero-title', {
            y: 25, opacity: 0, duration: 0.8, ease: 'power3.out'
        }, '-=0.3')
        .from('.hero-subtitle', {
            y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
        }, '-=0.4')
        .from('.hero-cta', {
            y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
        }, '-=0.3')
        .from('.hero-stats', {
            y: 20, opacity: 0, duration: 0.6, ease: 'power3.out'
        }, '-=0.3');

    // ── Counter Animation (stats) ──
    document.querySelectorAll('.hero-stat-value').forEach(el => {
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = '+';

        ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function () {
                        el.textContent = Math.round(this.targets()[0].val) + suffix;
                    }
                });
            }
        });
    });

    // ── Scroll Reveal (all .reveal elements) ──
    gsap.utils.toArray('.reveal').forEach((el, i) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none',
            },
            y: 40,
            opacity: 0,
            duration: 0.7,
            delay: (i % 3) * 0.1, // stagger within viewport batches
            ease: 'power3.out'
        });
    });

    // ── Navbar scroll effect ──
    ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
            const navbar = document.getElementById('navbar');
            if (self.direction === 1 && self.scroll() > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            navbar.style.transition = 'transform 0.3s ease';
        }
    });

    // ── ScrollSpy — active nav link ──
    const sections = ['hero', 'about', 'experience', 'projects', 'stacks', 'education'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;

        ScrollTrigger.create({
            trigger: section,
            start: 'top 40%',
            end: 'bottom 40%',
            onToggle: (self) => {
                if (self.isActive) {
                    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                        link.classList.toggle('active', link.getAttribute('data-section') === id);
                    });
                }
            }
        });
    });

    // ── Parallax for scroll indicator ──
    gsap.to('.scroll-indicator', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        },
        opacity: 0,
        y: -30
    });
}

// ══════════════════════════════════════════════════
// THEME TOGGLE
// ══════════════════════════════════════════════════

let particleNetwork = null;

function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'light') {
        document.documentElement.classList.remove('dark');
    } else if (saved === 'dark' || prefersDark) {
        document.documentElement.classList.add('dark');
    }

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Re-init icons
        setTimeout(() => lucide.createIcons(), 50);

        // Update Three.js colors
        if (particleNetwork) {
            particleNetwork.updateTheme();
        }
    });
}

// ══════════════════════════════════════════════════
// MOBILE MENU
// ══════════════════════════════════════════════════

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    let isOpen = false;

    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        menu.classList.toggle('open', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    menu.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            isOpen = false;
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', false);
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (isOpen && !menu.contains(e.target) && !btn.contains(e.target)) {
            isOpen = false;
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', false);
        }
    });

    // Close on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && isOpen) {
            isOpen = false;
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', false);
        }
    });
}

// ══════════════════════════════════════════════════
// SMOOTH SCROLL
// ══════════════════════════════════════════════════

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 70; // navbar height
                const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
}

// ══════════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════════

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('.lightbox-trigger').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

// ══════════════════════════════════════════════════
// MAGNETIC BUTTONS (subtle hover effect)
// ══════════════════════════════════════════════════

function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
    });
}

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════

function renderBrandIcons() {
    const githubSvg = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>';
    const linkedinSvg = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>';

    document.querySelectorAll('[data-lucide="github"]').forEach(el => {
        if (el.tagName.toLowerCase() === 'i') el.outerHTML = githubSvg;
    });
    document.querySelectorAll('[data-lucide="linkedin"]').forEach(el => {
        if (el.tagName.toLowerCase() === 'i') el.outerHTML = linkedinSvg;
    });
}

function initApp() {
    // Lucide icons
    if (typeof lucide !== 'undefined') {
        try { 
            lucide.createIcons(); 
            renderBrandIcons();
        } catch (e) { 
            console.warn('Lucide error:', e); 
        }
    }

    // Three.js Particle Network
    const canvas = document.getElementById('hero-canvas');
    if (canvas && typeof THREE !== 'undefined') {
        try {
            particleNetwork = new ParticleNetwork(canvas);
        } catch (e) {
            console.warn('Three.js initialization failed:', e);
        }
    }

    // Init modules
    try { initTheme(); } catch (e) { console.warn('Theme init error:', e); }
    try { initMobileMenu(); } catch (e) { console.warn('Mobile menu init error:', e); }
    try { initSmoothScroll(); } catch (e) { console.warn('Smooth scroll init error:', e); }
    try { initLightbox(); } catch (e) { console.warn('Lightbox init error:', e); }
    try { initMagneticButtons(); } catch (e) { console.warn('Magnetic buttons error:', e); }

    // GSAP animations
    if (typeof gsap !== 'undefined') {
        requestAnimationFrame(() => {
            try { initGSAP(); } catch (e) { console.warn('GSAP init error:', e); }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Re-init icons on visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && typeof lucide !== 'undefined') {
        setTimeout(() => {
            try { 
                lucide.createIcons(); 
                renderBrandIcons();
            } catch (e) {}
        }, 100);
    }
});
