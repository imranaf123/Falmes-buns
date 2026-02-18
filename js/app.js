/**
 * FLAME & BUNS - Main Application Module
 * Core functionality: Cart, Navigation, Scroll Effects, Notifications
 */

// ========================================
// CART MANAGEMENT
// ========================================

// Cart State
let cart = {
    items: [],
    total: 0
};

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('flameAndBunsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('flameAndBunsCart', JSON.stringify(cart));
}

/**
 * Add Item to Cart
 * @param {number} itemId - Menu item ID
 * @param {number} quantity - Quantity to add (default: 1)
 */
function addToCart(itemId, quantity = 1) {
    // Get item from menu data
    const item = getMenuItemById(itemId);
    if (!item) {
        showToast('Item not found!', 'error');
        return;
    }
    
    // Check if item already in cart
    const existingItem = cart.items.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: quantity
        });
    }
    
    // Recalculate total
    calculateCartTotal();
    
    // Save and update UI
    saveCart();
    updateCartUI();
    
    // Show notification
    showToast(`${item.name} added to cart!`);
    
    // Open cart sidebar
    openCart();
}

/**
 * Remove Item from Cart
 * @param {number} itemId - Menu item ID
 */
function removeFromCart(itemId) {
    cart.items = cart.items.filter(item => item.id !== itemId);
    calculateCartTotal();
    saveCart();
    updateCartUI();
    showToast('Item removed from cart');
}

/**
 * Update Item Quantity
 * @param {number} itemId - Menu item ID
 * @param {number} change - Quantity change (+1 or -1)
 */
function updateQuantity(itemId, change) {
    const item = cart.items.find(cartItem => cartItem.id === itemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    calculateCartTotal();
    saveCart();
    updateCartUI();
}

/**
 * Calculate Cart Total
 */
function calculateCartTotal() {
    cart.total = cart.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
}

/**
 * Clear Cart
 */
function clearCart() {
    cart.items = [];
    cart.total = 0;
    saveCart();
    updateCartUI();
    showToast('Cart cleared');
}

/**
 * Update Cart UI
 */
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update count badge
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update total
    if (cartTotal) {
        cartTotal.textContent = `$${cart.total.toFixed(2)}`;
    }
    
    // Update items list
    if (cartItems) {
        if (cart.items.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your cart is empty</p>
                    <span>Add some delicious items!</span>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

/**
 * Open Cart Sidebar
 */
function openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar) cartSidebar.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close Cart Sidebar
 */
function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// NAVIGATION
// ========================================

/**
 * Initialize Navigation
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
    });
    
    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close mobile menu if open
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                
                // Scroll to section
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Update Active Navigation Link
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ========================================
// SCROLL EFFECTS
// ========================================

/**
 * Initialize Scroll Effects
 */
function initScrollEffects() {
    const scrollTopBtn = document.getElementById('scrollTop');
    
    // Scroll to top button visibility
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top functionality
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Intersection Observer for scroll animations
    initScrollAnimations();
}

/**
 * Initialize Scroll Animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// NOTIFICATIONS
// ========================================

/**
 * Show Toast Notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('success' or 'error')
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon based on type
    const icon = toast.querySelector('i');
    if (icon) {
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        icon.style.color = type === 'error' ? '#c1121f' : '#25D366';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// CONTACT FORM
// ========================================

/**
 * Initialize Contact Form
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (!data.name || !data.email || !data.message) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Simulate form submission
            showToast('Message sent successfully! We\'ll get back to you soon.');
            contactForm.reset();
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', data);
        });
    }
}

// ========================================
// CART EVENT LISTENERS
// ========================================

/**
 * Initialize Cart Event Listeners
 */
function initCartEvents() {
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }
    
    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Close cart on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format Price
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

/**
 * Debounce Function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
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

/**
 * Throttle Function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

/**
 * Lazy Load Images
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

/**
 * Preload Critical Resources
 */
function preloadResources() {
    const criticalImages = [
        'images/hero-bg.jpg',
        'images/burger.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize Application
 */
function initApp() {
    // Load cart from storage
    loadCart();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize cart events
    initCartEvents();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Preload critical resources
    preloadResources();
    
    console.log('Flame & Buns App Initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Handle page visibility change (save cart when user leaves)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveCart();
    }
});

// Handle beforeunload (save cart before page closes)
window.addEventListener('beforeunload', () => {
    saveCart();
});
