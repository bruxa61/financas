/**
 * VintageFinance - Main JavaScript File
 * Handles common functionality across the application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        initializeTooltips();
    }
    
    // Initialize form enhancements
    initializeForms();
    
    // Initialize number formatting
    initializeNumberFormatting();
    
    // Initialize date inputs
    initializeDateInputs();
    
    // Initialize responsive tables
    initializeResponsiveTables();
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize form enhancements
 */
function initializeForms() {
    // Auto-focus first input in forms
    const firstInput = document.querySelector('.vintage-form input:not([type="hidden"]), .vintage-form select, .vintage-form textarea');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Add floating labels effect
    initializeFloatingLabels();
    
    // Validate forms on submit
    const forms = document.querySelectorAll('.vintage-form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // Handle amount input formatting
    const amountInputs = document.querySelectorAll('input[name="amount"]');
    amountInputs.forEach(input => {
        input.addEventListener('blur', formatAmountInput);
        input.addEventListener('input', validateAmountInput);
    });
    
    // Handle category filtering in transaction forms
    const typeSelects = document.querySelectorAll('select[name="transaction_type"]');
    typeSelects.forEach(select => {
        select.addEventListener('change', function() {
            if (typeof filterCategories === 'function') {
                filterCategories(this.value);
            }
        });
    });
}

/**
 * Initialize floating labels for form inputs
 */
function initializeFloatingLabels() {
    const inputs = document.querySelectorAll('.vintage-form-control');
    
    inputs.forEach(input => {
        // Add focus/blur handlers
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Initialize state
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Disable submit button to prevent double submission
    if (submitButton) {
        submitButton.disabled = true;
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i data-feather="loader" class="spinning"></i> Processing...';
        
        // Re-enable button after 3 seconds as fallback
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 3000);
    }
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    if (!isValid) {
        event.preventDefault();
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
        showNotification('Please fill in all required fields.', 'error');
    }
}

/**
 * Format amount input on blur
 */
function formatAmountInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    
    if (!isNaN(value) && value > 0) {
        input.value = value.toFixed(2);
    }
}

/**
 * Validate amount input on change
 */
function validateAmountInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    
    if (isNaN(value) || value <= 0) {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
}

/**
 * Initialize number formatting for display
 */
function initializeNumberFormatting() {
    const numberElements = document.querySelectorAll('.format-currency');
    
    numberElements.forEach(element => {
        const value = parseFloat(element.textContent);
        if (!isNaN(value)) {
            element.textContent = formatCurrency(value);
        }
    });
}

/**
 * Format currency values
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Initialize date inputs with proper formatting
 */
function initializeDateInputs() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Set max date to today
        if (!input.hasAttribute('max')) {
            const today = new Date().toISOString().split('T')[0];
            input.setAttribute('max', today);
        }
        
        // Set default value to today if empty
        if (!input.value && input.name === 'transaction_date') {
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
        }
    });
}

/**
 * Initialize responsive tables
 */
function initializeResponsiveTables() {
    const tables = document.querySelectorAll('.vintage-table');
    
    tables.forEach(table => {
        const wrapper = table.closest('.table-responsive');
        if (wrapper) {
            // Add scroll indicators
            updateScrollIndicators(wrapper);
            wrapper.addEventListener('scroll', () => updateScrollIndicators(wrapper));
        }
    });
}

/**
 * Update scroll indicators for responsive tables
 */
function updateScrollIndicators(wrapper) {
    const scrollLeft = wrapper.scrollLeft;
    const scrollWidth = wrapper.scrollWidth;
    const clientWidth = wrapper.clientWidth;
    
    wrapper.classList.toggle('scroll-left', scrollLeft > 0);
    wrapper.classList.toggle('scroll-right', scrollLeft < scrollWidth - clientWidth - 1);
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast vintage-alert vintage-alert-${type === 'error' ? 'error' : 'success'}`;
    notification.innerHTML = `
        <i data-feather="${type === 'error' ? 'alert-circle' : 'check-circle'}"></i>
        ${message}
        <button type="button" class="vintage-btn-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Replace feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/**
 * Animate counting numbers
 */
function animateValue(element, start, end, duration = 1000) {
    const startTimestamp = performance.now();
    const step = (timestamp) => {
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeOutCubic(progress);
        element.textContent = Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

/**
 * Easing function for animations
 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Utility function to format dates
 */
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

/**
 * Utility function to handle async operations with loading states
 */
async function withLoading(asyncFunction, loadingElement = null) {
    if (loadingElement) {
        loadingElement.classList.add('loading');
    }
    
    try {
        const result = await asyncFunction();
        return result;
    } catch (error) {
        console.error('Operation failed:', error);
        showNotification('An error occurred. Please try again.', 'error');
        throw error;
    } finally {
        if (loadingElement) {
            loadingElement.classList.remove('loading');
        }
    }
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .spinning {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .loading {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .is-invalid {
        border-color: var(--vintage-red) !important;
        box-shadow: 0 0 0 0.2rem rgba(191, 138, 125, 0.25) !important;
    }
    
    .table-responsive.scroll-left::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 20px;
        background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
        pointer-events: none;
        z-index: 1;
    }
    
    .table-responsive.scroll-right::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 20px;
        background: linear-gradient(to left, rgba(0,0,0,0.1), transparent);
        pointer-events: none;
        z-index: 1;
    }
`;

document.head.appendChild(notificationStyles);

// Export functions for global use
window.VintageFinance = {
    formatCurrency,
    formatDate,
    showNotification,
    animateValue,
    debounce,
    withLoading
};
