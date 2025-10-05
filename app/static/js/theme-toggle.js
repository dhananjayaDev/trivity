// Theme Toggle Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        
        this.init();
    }
    
    init() {
        // Apply stored theme or system preference
        this.applyTheme(this.currentTheme);
        
        // Add event listener for theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        // Ensure theme is applied even after page navigation
        window.addEventListener('pageshow', () => {
            this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
            this.applyTheme(this.currentTheme);
        });
    }
    
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    getStoredTheme() {
        return localStorage.getItem('theme');
    }
    
    setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }
    
    applyTheme(theme) {
        const html = document.documentElement;
        const isDark = theme === 'dark';
        
        // Remove existing theme classes
        html.classList.remove('light-theme', 'dark-theme');
        
        // Apply new theme class
        if (isDark) {
            html.classList.add('dark-theme');
        } else {
            // Light theme is default, no class needed
        }
        
        // Update theme icon
        if (this.themeIcon) {
            this.themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
        }
        
        // Update theme toggle title
        if (this.themeToggle) {
            this.themeToggle.title = `Switch to ${isDark ? 'light' : 'dark'} theme`;
        }
        
        // Store theme preference
        this.setStoredTheme(theme);
        this.currentTheme = theme;
        
        // Update chart colors if charts exist
        this.updateChartColors(theme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Add a subtle animation effect
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 150);
    }
    
    updateChartColors(theme) {
        // Update Chart.js colors based on theme
        const isDark = theme === 'dark';
        
        // Update any existing charts
        if (window.Chart && window.Chart.instances) {
            Object.values(window.Chart.instances).forEach(chart => {
                if (chart.config && chart.config.data) {
                    // Update chart colors
                    const colors = isDark ? 
                        ['#1976d2', '#42a5f5', '#4caf50', '#ff9800', '#f44336'] :
                        ['#007bff', '#17a2b8', '#28a745', '#ffc107', '#dc3545'];
                    
                    if (chart.config.data.datasets) {
                        chart.config.data.datasets.forEach((dataset, index) => {
                            if (dataset.backgroundColor) {
                                dataset.backgroundColor = colors[index % colors.length];
                            }
                            if (dataset.borderColor) {
                                dataset.borderColor = colors[index % colors.length];
                            }
                        });
                    }
                    
                    chart.update('none'); // Update without animation for smooth theme switch
                }
            });
        }
    }
    
    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // Public method to set theme programmatically
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.applyTheme(theme);
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
