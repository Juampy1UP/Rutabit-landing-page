/**
 * =========================================
 * [SECTION 1]: CORE DOCUMENTATION
 * RUTABIT FRONTEND CORE v2.0
 * Lógica principal de UI, optimizaciones y gestión de estado.
 * @author Rutabit Dev Team
 * =========================================
 */

'use strict';


/**
 * =========================================
 * [SECTION 2]: GLOBAL CONFIGURATION
 * Configuración centralizada de parámetros y constantes.
 * =========================================
 */
const AppConfig = {
    minPreloaderTime: 1200, // UX: Tiempo mínimo de carga visual
    scrollThreshold: 20,    // Umbral para activar navbar
    isProduction: window.location.hostname === "rutabit.com.ar" || window.location.hostname === "www.rutabit.com.ar" || window.location.hostname === "104.131.36.79"
};

/**
 * =========================================
 * [SECTION 3]: ERROR HANDLING MODULE
 * Captura y gestión de errores en tiempo de ejecución.
 * =========================================
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
 * =========================================
 * [SECTION 4]: NETWORK MONITOR MODULE
 * Detección de estado online/offline y alertas de UI.
 * =========================================
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
 * =========================================
 * [SECTION 5]: NAVBAR CONTROLLER
 * Gestión de la barra de navegación, scrollspy y menú móvil.
 * =========================================
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
 * =========================================
 * [SECTION 6]: PRELOADER MODULE
 * Lógica de la pantalla de carga inicial y transición.
 * =========================================
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
 * =========================================
 * [SECTION 7]: EXTERNAL VENDORS
 * Inicialización de librerías externas (AOS, etc).
 * =========================================
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

/**
 * =========================================
 * [SECTION 8]: DRAG SCROLL CLASS
 * Clase reutilizable para scroll con arrastre (touch/mouse).
 * =========================================
 */
class DragScroll {
    constructor(selector) {
        this.container = document.querySelector(selector);
        this.isDown = false;
        this.startX = 0;
        this.scrollLeft = 0;

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.container.addEventListener('mousedown', (e) => this.start(e));
        this.container.addEventListener('mouseleave', () => this.end());
        this.container.addEventListener('mouseup', () => this.end());
        this.container.addEventListener('mousemove', (e) => this.move(e));
    }

    start(e) {
        this.isDown = true;
        this.container.classList.add('active');
        this.startX = e.pageX - this.container.offsetLeft;
        this.scrollLeft = this.container.scrollLeft;
    }

    end() {
        this.isDown = false;
        this.container.classList.remove('active');
    }

    move(e) {
        if (!this.isDown) return;
        e.preventDefault();
        const x = e.pageX - this.container.offsetLeft;
        const walk = (x - this.startX) * 2; // Velocidad de scroll
        this.container.scrollLeft = this.scrollLeft - walk;
    }
}


/**
 * =========================================
 * [SECTION 9]: APP INITIALIZATION
 * Punto de entrada: Bootstrapping de todos los módulos.
 * =========================================
 */
document.addEventListener('DOMContentLoaded', () => {
    ErrorHandler.init();
    NetworkMonitor.init();
    NavbarController.init();
    Preloader.init();
    Vendors.init();
    
    // Init DragScroll for multiple instances
    new DragScroll('.plans-slider-container');
    new DragScroll('.testimonials-slider-container'); 
    
    // Init WhatsApp Widget
    WhatsAppWidget.init();

    // Init Scroll Progress
    ScrollProgress.init();
});

/**
 * =========================================
 * [SECTION 10]: WHATSAPP WIDGET MODULE
 * Lógica del botón flotante y burbuja de chat.
 * =========================================
 */
const WhatsAppWidget = {
    init() {
        const widget = document.getElementById('whatsapp-widget');
        const bubble = document.querySelector('.whatsapp-bubble');
        const closeBtn = document.querySelector('.close-bubble');

        if (!widget || !bubble) return;

        // Show Widget after preloader
        setTimeout(() => {
            widget.classList.add('active-widget');
            
            // Show Bubble with delay
            setTimeout(() => {
                 bubble.classList.add('show');
            }, 500);
            
        }, 2500);

        // Close logic
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering other clicks
                bubble.classList.remove('show');
                // Optional: Remove completely after transition
                setTimeout(() => bubble.style.display = 'none', 500);
            });
        }

        // Auto-close after 15 seconds to be less intrusive
        setTimeout(() => {
            if (bubble.classList.contains('show')) {
                bubble.classList.remove('show');
            }
        }, 20000); 
    }
};

/**
 * =========================================
 * [SECTION 11]: SCROLL PROGRESS MODULE
 * Barra de progreso de lectura en la parte superior.
 * =========================================
 */
const ScrollProgress = {
    init() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = scrolled + "%";
        });
    }
};