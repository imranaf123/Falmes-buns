/**
 * FLAME & BUNS - Menu Module
 * Handles dynamic loading and filtering of menu items from JSON
 */

// Menu Data Storage
let menuData = {
    items: [],
    categories: []
};

// Current filter state
let currentFilter = 'all';

/**
 * Initialize Menu Module
 * Loads menu data from JSON and renders the menu
 */
async function initMenu() {
    try {
        const response = await fetch('data/menu.json');
        if (!response.ok) {
            throw new Error('Failed to load menu data');
        }
        
        const data = await response.json();
        menuData.items = data.menuItems || [];
        menuData.categories = data.categories || [];
        
        renderCategoryFilters();
        renderMenuItems();
        
        console.log('Menu loaded successfully:', menuData.items.length, 'items');
    } catch (error) {
        console.error('Error loading menu:', error);
        showMenuError('Failed to load menu. Please refresh the page.');
    }
}

/**
 * Render Category Filter Buttons
 */
function renderCategoryFilters() {
    const filtersContainer = document.getElementById('categoryFilters');
    if (!filtersContainer) return;
    
    // Check if categories exist
    if (!menuData.categories || menuData.categories.length === 0) {
        // Default categories if none provided
        menuData.categories = [
            { id: 'all', name: 'All Items', icon: '🍽️' },
            { id: 'burgers', name: 'Burgers', icon: '🍔' },
            { id: 'chicken', name: 'Chicken', icon: '🍗' },
            { id: 'pizza', name: 'Pizza', icon: '🍕' },
            { id: 'sides', name: 'Sides', icon: '🍟' },
            { id: 'drinks', name: 'Drinks', icon: '🥤' }
        ];
    }
    
    const filtersHTML = menuData.categories.map(category => `
        <button 
            class="filter-btn ${category.id === 'all' ? 'active' : ''}" 
            data-category="${category.id}"
            onclick="filterMenu('${category.id}')"
        >
            <span>${category.icon}</span>
            ${category.name}
        </button>
    `).join('');
    
    filtersContainer.innerHTML = filtersHTML;
}

/**
 * Render Menu Items
 * @param {string} category - Category to filter by (default: 'all')
 */
function renderMenuItems(category = 'all') {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    // Filter items
    const filteredItems = category === 'all' 
        ? menuData.items 
        : menuData.items.filter(item => item.category === category);
    
    // Show loading state
    if (filteredItems.length === 0) {
        menuGrid.innerHTML = `
            <div class="menu-empty">
                <i class="fas fa-search"></i>
                <p>No items found in this category</p>
            </div>
        `;
        return;
    }
    
    // Render items with animation delay
    const itemsHTML = filteredItems.map((item, index) => `
        <article class="menu-card" style="animation-delay: ${index * 0.1}s">
            <div class="menu-card-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                ${item.popular ? '<span class="menu-card-badge">Popular</span>' : ''}
            </div>
            <div class="menu-card-content">
                <div class="menu-card-header">
                    <div>
                        <h3 class="menu-card-title">${item.name}</h3>
                    </div>
                    <span class="menu-card-price">$${item.price.toFixed(2)}</span>
                </div>
                <p class="menu-card-description">${item.description}</p>
                <div class="menu-card-footer">
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                    <a href="https://wa.me/1234567890?text=Hi! I'd like to order: ${encodeURIComponent(item.name)}" 
                       class="whatsapp-order-btn" 
                       target="_blank"
                       title="Order via WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </article>
    `).join('');
    
    menuGrid.innerHTML = itemsHTML;
    
    // Add scroll animation
    addScrollAnimation();
}

/**
 * Filter Menu by Category
 * @param {string} category - Category ID to filter by
 */
function filterMenu(category) {
    currentFilter = category;
    
    // Update active button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Re-render items with animation
    renderMenuItems(category);
}

/**
 * Show Menu Error Message
 * @param {string} message - Error message to display
 */
function showMenuError(message) {
    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
        menuGrid.innerHTML = `
            <div class="menu-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button onclick="initMenu()" class="btn btn-primary">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Add Scroll Animation to Menu Cards
 */
function addScrollAnimation() {
    const cards = document.querySelectorAll('.menu-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

/**
 * Search Menu Items
 * @param {string} query - Search query
 */
function searchMenu(query) {
    if (!query || query.trim() === '') {
        renderMenuItems(currentFilter);
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const filteredItems = menuData.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    
    // Temporarily override render with search results
    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
        if (filteredItems.length === 0) {
            menuGrid.innerHTML = `
                <div class="menu-empty">
                    <i class="fas fa-search"></i>
                    <p>No items found for "${query}"</p>
                </div>
            `;
            return;
        }
        
        const itemsHTML = filteredItems.map((item, index) => `
            <article class="menu-card" style="animation-delay: ${index * 0.1}s">
                <div class="menu-card-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    ${item.popular ? '<span class="menu-card-badge">Popular</span>' : ''}
                </div>
                <div class="menu-card-content">
                    <div class="menu-card-header">
                        <div>
                            <h3 class="menu-card-title">${item.name}</h3>
                        </div>
                        <span class="menu-card-price">$${item.price.toFixed(2)}</span>
                    </div>
                    <p class="menu-card-description">${item.description}</p>
                    <div class="menu-card-footer">
                        <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                            <i class="fas fa-plus"></i> Add to Cart
                        </button>
                        <a href="https://wa.me/1234567890?text=Hi! I'd like to order: ${encodeURIComponent(item.name)}" 
                           class="whatsapp-order-btn" 
                           target="_blank"
                           title="Order via WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
        
        menuGrid.innerHTML = itemsHTML;
    }
}

/**
 * Get Menu Item by ID
 * @param {number} id - Item ID
 * @returns {Object|null} Menu item object
 */
function getMenuItemById(id) {
    return menuData.items.find(item => item.id === id) || null;
}

/**
 * Get All Menu Items
 * @returns {Array} All menu items
 */
function getAllMenuItems() {
    return menuData.items;
}

/**
 * Get Menu Items by Category
 * @param {string} category - Category ID
 * @returns {Array} Filtered menu items
 */
function getMenuItemsByCategory(category) {
    return menuData.items.filter(item => item.category === category);
}

// Initialize menu when DOM is ready
document.addEventListener('DOMContentLoaded', initMenu);
