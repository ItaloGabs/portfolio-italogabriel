// Portfolio JavaScript

class Portfolio {
    constructor() {
        this.currentPage = 'home';
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.initializeIcons();
        this.setupEventListeners();
        this.setupTheme();
        this.setupNavigation();
        this.setupAnimations();
        this.setupProgressBars();
    }

    // Initialize Lucide icons
    initializeIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Navigation links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-page');
                this.navigateToPage(page);
                this.closeMobileMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuButton = document.getElementById('mobile-menu-button');

            if (this.mobileMenuOpen &&
                !mobileMenu.contains(e.target) &&
                !mobileMenuButton.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    // Theme management
    setupTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        });
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');

        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }

        // Reinitialize icons after theme change
        setTimeout(() => this.initializeIcons(), 100);
    }

    // Mobile menu management
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const mobileMenu = document.getElementById('mobile-menu');

        if (this.mobileMenuOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('animate-slide-down');
        } else {
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('animate-slide-down');
    }

    // Navigation management
    setupNavigation() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            this.showPage(page);
            this.updateActiveNavigation(page);
        });

        // Set initial state
        const hash = window.location.hash.slice(1) || 'home';
        this.navigateToPage(hash, false);
    }

    navigateToPage(page, pushState = true) {
        this.currentPage = page;
        this.showPage(page);
        this.updateActiveNavigation(page);

        if (pushState) {
            history.pushState({ page }, '', `#${page}`);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(pageEl => {
            pageEl.classList.add('hidden');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');

            // Trigger animations for the new page
            this.animatePageElements(targetPage);
        }
    }

    updateActiveNavigation(page) {
        // Update desktop navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update mobile navigation
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Animation management
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        document.querySelectorAll('.card, .project-card, .skill-item').forEach(el => {
            observer.observe(el);
        });
    }

    animatePageElements(pageElement) {
        const animatableElements = pageElement.querySelectorAll('.card, .project-card, .skill-item');

        animatableElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';

            setTimeout(() => {
                el.style.transition = 'all 0.6s ease-out';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Animate progress bars if on stacks page
        if (pageElement.id === 'stacks-page') {
            setTimeout(() => this.animateProgressBars(), 300);
        }
    }

    // Progress bar animations
    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            bar.style.width = '0%';
        });
    }

    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach((bar, index) => {
            setTimeout(() => {
                const targetWidth = bar.style.width;
                bar.style.width = '0%';

                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 50);
            }, index * 200);
        });
    }

    // Utility methods
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
    }

    // Contact form handling (if needed)
    handleContactForm(formData) {
        // Placeholder for contact form submission
        console.log('Contact form submitted:', formData);

        // Here you would typically send the data to a server
        // For demo purposes, we'll just show a success message
        this.showNotification('Mensagem enviada com sucesso!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Portfolio();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Reinitialize icons when page becomes visible
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    }
});

// Export for potential use in modules
window.Portfolio = Portfolio;
