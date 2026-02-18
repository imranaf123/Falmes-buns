/**
 * FLAME & BUNS - Deals Module
 * Handles dynamic loading and display of special deals from JSON
 */

// Deals Data Storage
let dealsData = [];

/**
 * Initialize Deals Module
 * Loads deals data from JSON and renders the deals section
 */
async function initDeals() {
    try {
        const response = await fetch('data/deals.json');
        if (!response.ok) {
            throw new Error('Failed to load deals data');
        }
        
        const data = await response.json();
        dealsData = data.deals || [];
        
        renderDeals();
        
        console.log('Deals loaded successfully:', dealsData.length, 'deals');
    } catch (error) {
        console.error('Error loading deals:', error);
        showDealsError('Failed to load deals. Please refresh the page.');
    }
}

/**
 * Render Deals Cards
 */
function renderDeals() {
    const dealsGrid = document.getElementById('dealsGrid');
    if (!dealsGrid) return;
    
    // Check if deals exist
    if (dealsData.length === 0) {
        dealsGrid.innerHTML = `
            <div class="deals-empty">
                <i class="fas fa-tag"></i>
                <p>No deals available at the moment</p>
                <span>Check back soon for exciting offers!</span>
            </div>
        `;
        return;
    }
    
    // Render deals with animation delay
    const dealsHTML = dealsData.map((deal, index) => `
        <article class="deal-card ${deal.popular ? 'popular' : ''}" style="animation-delay: ${index * 0.15}s">
            ${deal.badge ? `<span class="deal-badge">${deal.badge}</span>` : ''}
            <div class="deal-card-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy">
            </div>
            <div class="deal-card-content">
                <p class="deal-card-subtitle">${deal.subtitle}</p>
                <h3 class="deal-card-title">${deal.title}</h3>
                <ul class="deal-card-items">
                    ${deal.items.map(item => `
                        <li><i class="fas fa-check"></i> ${item}</li>
                    `).join('')}
                </ul>
                <div class="deal-card-footer">
                    <div class="deal-price">
                        <span class="deal-current-price">$${deal.price.toFixed(2)}</span>
                        <span class="deal-original-price">$${deal.originalPrice.toFixed(2)}</span>
                    </div>
                    <a href="https://wa.me/1234567890?text=Hi! I'd like to order the ${encodeURIComponent(deal.title)} deal for $${deal.price}" 
                       class="deal-order-btn" 
                       target="_blank">
                        <i class="fab fa-whatsapp"></i> Order
                    </a>
                </div>
            </div>
        </article>
    `).join('');
    
    dealsGrid.innerHTML = dealsHTML;
    
    // Add scroll animation
    addDealsScrollAnimation();
}

/**
 * Show Deals Error Message
 * @param {string} message - Error message to display
 */
function showDealsError(message) {
    const dealsGrid = document.getElementById('dealsGrid');
    if (dealsGrid) {
        dealsGrid.innerHTML = `
            <div class="deals-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button onclick="initDeals()" class="btn btn-primary">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

/**
 * Add Scroll Animation to Deal Cards
 */
function addDealsScrollAnimation() {
    const cards = document.querySelectorAll('.deal-card');
    
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
 * Get Deal by ID
 * @param {number} id - Deal ID
 * @returns {Object|null} Deal object
 */
function getDealById(id) {
    return dealsData.find(deal => deal.id === id) || null;
}

/**
 * Get All Deals
 * @returns {Array} All deals
 */
function getAllDeals() {
    return dealsData;
}

/**
 * Get Popular Deals
 * @returns {Array} Popular deals only
 */
function getPopularDeals() {
    return dealsData.filter(deal => deal.popular);
}

/**
 * Calculate Savings for a Deal
 * @param {number} dealId - Deal ID
 * @returns {number} Savings amount
 */
function calculateSavings(dealId) {
    const deal = getDealById(dealId);
    if (!deal) return 0;
    return deal.originalPrice - deal.price;
}

/**
 * Format Deal for WhatsApp Message
 * @param {number} dealId - Deal ID
 * @returns {string} Formatted WhatsApp message
 */
function formatDealForWhatsApp(dealId) {
    const deal = getDealById(dealId);
    if (!deal) return '';
    
    const savings = calculateSavings(dealId);
    let message = `Hi! I'd like to order the *${deal.title}* deal.\n\n`;
    message += `Price: $${deal.price.toFixed(2)}\n`;
    message += `You Save: $${savings.toFixed(2)}!\n\n`;
    message += `Includes:\n`;
    deal.items.forEach(item => {
        message += `• ${item}\n`;
    });
    
    return encodeURIComponent(message);
}

// Initialize deals when DOM is ready
document.addEventListener('DOMContentLoaded', initDeals);
