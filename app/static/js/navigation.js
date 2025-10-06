// Navigation functionality for the sustainability platform
class NavigationManager {
    constructor() {
        this.currentPage = null;
        this.init();
    }
    
    init() {
        // Set up navigation event listeners
        this.setupNavigationListeners();
        
        // Get current page from URL
        this.currentPage = this.getCurrentPageFromUrl();
        
        // Initialize the current page
        this.updateActiveNavItem(this.currentPage);
        this.updateBreadcrumb(this.currentPage);
    }
    
    setupNavigationListeners() {
        // Add click event listeners to all navigation buttons
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const page = button.getAttribute('data-page');
                if (page && !button.classList.contains('coming-soon')) {
                    this.navigateTo(page);
                }
            });
        });
    }
    
    getCurrentPageFromUrl() {
        const path = window.location.pathname;
        const pageMap = {
            '/': 'dashboard',
            '/sustainability-index': 'sustainability-index',
            '/recommended-sdgs': 'recommended-sdgs',
            '/data-center': 'data-center',
            '/carbon-calculator': 'carbon-calculator',
            '/reports': 'reports',
            '/auth/profile': 'profile'
        };
        return pageMap[path] || 'dashboard';
    }
    
    navigateTo(page) {
        // Update current page
        this.currentPage = page;
        
        // Update active navigation item
        this.updateActiveNavItem(page);
        
        // Update breadcrumb
        this.updateBreadcrumb(page);
        
        // Navigate to the page only if it's different from current page
        this.loadPage(page);
    }
    
    updateActiveNavItem(page) {
        // Remove active class from all nav buttons
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Add active class to current page button
        const currentButton = document.querySelector(`[data-page="${page}"]`);
        if (currentButton) {
            currentButton.classList.add('active');
        }
    }
    
    updateBreadcrumb(page) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        
        // Simplified breadcrumb mapping - just the main section
            const breadcrumbMap = {
                'dashboard': 'Dashboard',
                'sustainability-index': 'Sustainability Index',
                'recommended-sdgs': 'UN SDGs',
                'data-center': 'Data Center',
                'carbon-calculator': 'Carbon Calculator',
                'reports': 'Reports & Analytics',
                'profile': 'Profile'
            };
        
        const breadcrumbText = breadcrumbMap[page];
        if (breadcrumbText) {
            breadcrumb.innerHTML = `
                <span class="breadcrumb-item active">${breadcrumbText}</span>
            `;
        }
    }
    
    loadPage(page) {
        // Map pages to their URLs
            const pageUrls = {
                'dashboard': '/',
                'sustainability-index': '/sustainability-index',
                'recommended-sdgs': '/recommended-sdgs',
                'data-center': '/data-center',
                'carbon-calculator': '/carbon-calculator',
                'reports': '/reports',
                'profile': '/auth/profile'
            };
        
        const url = pageUrls[page];
        const currentPath = window.location.pathname;
        
        // Only navigate if we're not already on the target page
        if (url && url !== currentPath) {
            // Navigate to the page
            window.location.href = url;
        } else if (url === currentPath) {
            // We're already on this page, just update the UI
            console.log(`Already on ${page} page`);
        }
    }
    
    showNavigationMessage(page) {
        const pageNames = {
            'dashboard': 'Dashboard',
            'sustainability-index': 'Sustainability Readiness Index',
            'recommended-sdgs': 'Recommended UN SDGs',
            'data-center': 'Data Center',
            'carbon-calculator': 'Carbon Emissions Calculator'
        };
        
        const pageName = pageNames[page] || page;
        
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            padding: 16px;
            color: var(--text-primary);
            box-shadow: var(--shadow-md);
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-icons" style="color: var(--accent-green);">check_circle</span>
                <span>Navigating to ${pageName}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Public method to get current page
    getCurrentPage() {
        return this.currentPage;
    }
    
    // Public method to set page programmatically
    setPage(page) {
        this.navigateTo(page);
    }
}

// Initialize navigation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Global navigation function for onclick handlers
function navigateTo(page) {
    if (window.navigationManager) {
        window.navigationManager.navigateTo(page);
    }
}

// User menu functionality
function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function signOut() {
    // Close the dropdown
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    // Redirect to logout
    window.location.href = '/auth/logout';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userMenuDropdown');
    const toggle = document.querySelector('.user-menu-toggle');
    
    if (dropdown && toggle && !dropdown.contains(event.target) && !toggle.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}
