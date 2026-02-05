/**
 * RUTABIT FRONTEND CORE
 * v2.0 - Optimized & Modularized
 * ------------------------------------------------
 * @author Rutabit Dev Team
 * @description Core logic for UI interactions, performance optimizations and state management.
 */

'use strict';

const AppConfig = {
    minPreloaderTime: 1200, // UX: Tiempo mínimo de carga visual
    scrollThreshold: 20,    // Umbral para activar navbar
    isProduction: window.location.hostname === "rutabit.com.ar" || window.location.hostname === "www.rutabit.com.ar" || window.location.hostname === "104.131.36.79"
};

/**
 * Módulo de Manejo de Errores Globales
 */
const ErrorHandler = {
    init() {
        window.onerror = (message) => {
            // Ignorar errores triviales de entorno de desarrollo
            if (message.includes("ResizeObserver") || message.includes("Live Server")) return;

            console.error("🚨 CRASH DETECTADO:", message);

            if (AppConfig.isProduction) {
                // Redirección segura a página de error
                sessionStorage.setItem('lastError', message);
                //window.location.href = '/500.html';
            }
        };
    }
};

/**
 * Módulo de Monitor de Red (Offline/Online)
 */
const NetworkMonitor = {
    init() {
        window.addEventListener('offline', this.showOfflineAlert);
        window.addEventListener('online', this.showOnlineAlert);
    },

    showOfflineAlert() {
        const msg = document.createElement('div');
        msg.id = 'network-alert';
        msg.className = 'fixed-top bg-danger text-white text-center py-2 fw-bold small coming-in-anim';
        msg.style.zIndex = '10000';
        msg.innerHTML = '<i class="bi bi-wifi-off me-2"></i> CONEXIÓN PERDIDA - Intentando reconectar...';
        document.body.prepend(msg);
    },

    showOnlineAlert() {
        const msg = document.getElementById('network-alert');
        if (msg) {
            msg.className = 'fixed-top bg-success text-white text-center py-2 fw-bold small';
            msg.innerHTML = '<i class="bi bi-wifi me-2"></i> CONEXIÓN RESTABLECIDA';
            setTimeout(() => msg.remove(), 3000);
        }
    }
};

/**
 * Módulo de UI: Navbar y ScrollSpy
 */
const NavbarController = {
    navbar: document.getElementById('mainNav'),
    sections: document.querySelectorAll('section, header'),
    navLinks: document.querySelectorAll('.nav-link'),
    menuToggle: document.getElementById('navbarNav'),
    ticking: false,

    init() {
        if (!this.navbar) return;

        // Optimized Scroll Handler (RequestAnimationFrame)
        window.addEventListener('scroll', () => this.onScroll());

        // Smooth Scroll para anclas
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Cierre automático de menú móvil
        this.navLinks.forEach((l) => {
            l.addEventListener('click', () => this.closeMobileMenu());
        });
    },

    onScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.updateNavbarStyle();
                this.updateActiveLink();
                this.ticking = false;
            });
            this.ticking = true;
        }
    },

    updateNavbarStyle() {
        if (window.scrollY > AppConfig.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    },

    updateActiveLink() {
        let currentSectionId = '';

        // Detección de sección visible
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Margen de -150px para compensar el header fijo
            if (window.scrollY >= (sectionTop - 150)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSectionId)) {
                link.classList.add('active');
            }
        });
    },

    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            this.closeMobileMenu();
        }
    },

    closeMobileMenu() {
        if (window.innerWidth < 992 && typeof bootstrap !== 'undefined') {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(this.menuToggle);
            bsCollapse.hide();
        }
    }
};

/**
 * Módulo de Preloader 
 */
const Preloader = {
    el: document.getElementById('preloader'),
    startTime: Date.now(),

    init() {
        if (!this.el) return;

        window.addEventListener('load', () => this.finish());
    },

    finish() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, AppConfig.minPreloaderTime - elapsedTime);

        setTimeout(() => {
            this.el.classList.add('preloader-hidden');
            // Console Art
            console.log('%c R U T A B I T %c System Online 🟢',
                'font-weight: bold; font-size: 20px; color: #00E5FF; background: #051130; padding: 5px;',
                'color: #fff; background: #051130; padding: 5px;');

            setTimeout(() => this.el.remove(), 500);
        }, remainingTime);
    }
};

/**
 * Módulo de Librerías Externas
 */
const Vendors = {
    init() {
        // Init AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 50,
                easing: 'ease-out-cubic'
            });
        }
    }
};

// --- BOOTSTRAP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    ErrorHandler.init();
    NetworkMonitor.init();
    NavbarController.init();
    Preloader.init();
    Vendors.init();
});