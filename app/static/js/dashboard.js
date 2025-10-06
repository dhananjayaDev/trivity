/**
 * Dashboard Manager
 * Handles the main dashboard with scoring system, rewards, and SDG recommendations
 */

class DashboardManager {
    constructor() {
        this.userData = null;
        this.aiService = null;
        
        // Default data (no assessment completed)
        this.scores = {
            total: 0.0,
            general: 0.0,
            environment: 0.0,
            social: 0.0,
            governance: 0.0
        };
        
        this.hasAssessment = false;
        
        this.achievements = {
            medal: "2024 Champion of Sustainability",
            level: "Advanced",
            badges: ["First Assessment", "Environment Focus", "Social Impact"]
        };
        
        this.sdgRecommendations = {
            primary: {
                goal: 7,
                title: "Affordable and Clean Energy",
                description: "Goals that are relevant with immediate opportunities",
                icon: "⚡",
                color: "#ffc107"
            },
            secondary: {
                goal: 13,
                title: "Climate Action",
                description: "Goals that are relevant with long term opportunities",
                icon: "🌍",
                color: "#4caf50"
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize AI service
            this.aiService = window.aiService;
            
            // Load real user data
            await this.loadUserData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize dashboard components
            this.initializeCircularProgress();
            this.updateScoreDisplays();
            this.updateAchievementDisplay();
            this.loadCompanyData();
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.loadFallbackData();
        }
    }
    
    async loadUserData() {
        try {
            // Clear any cached data first
            this.clearCache();
            
            const response = await fetch('/api/dashboard/data', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const result = await response.json();
            
            if (result.success) {
                this.userData = result.data;
                console.log('User data loaded:', this.userData);
                
                // Update scores with real data
                if (this.userData.sri_scores && this.userData.has_sri_assessment) {
                    this.hasAssessment = true;
                    this.scores = {
                        total: this.userData.sri_scores.total,
                        general: this.userData.sri_scores.categories.general,
                        environment: this.userData.sri_scores.categories.environment,
                        social: this.userData.sri_scores.categories.social,
                        governance: this.userData.sri_scores.categories.governance
                    };
                    
                    // Update trophy highlighting with real scores
                    this.updateTrophyHighlighting();
                    
                    // Update score description based on assessment status
                    this.updateScoreDescription();
                    
                    // Update UI with real scores
                    this.updateScoreDisplays();
                } else {
                    // No assessment completed
                    this.hasAssessment = false;
                    this.updateNoAssessmentState();
                }
                
                // Update SDG recommendations with real data
                if (this.userData.sdg_recommendations && this.userData.sdg_recommendations.length >= 2) {
                    this.sdgRecommendations = {
                        primary: this.userData.sdg_recommendations[0],
                        secondary: this.userData.sdg_recommendations[1]
                    };
                    this.updateSDGDisplay();
                }
                
            } else {
                throw new Error(result.error || 'Failed to load user data');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.loadFallbackData();
        }
    }
    
    clearCache() {
        // Clear any cached data in localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('sri_') || key.startsWith('dashboard_') || key.startsWith('assessment_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear any cached data in sessionStorage
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
            if (key.startsWith('sri_') || key.startsWith('dashboard_') || key.startsWith('assessment_')) {
                sessionStorage.removeItem(key);
            }
        });
    }
    
    loadFallbackData() {
        // Use fallback data when real data is not available
        console.log('Using fallback data');
        
        // Show no assessment state
        this.hasAssessment = false;
        this.updateNoAssessmentState();
    }
    
    updateNoAssessmentState() {
        // Reset scores to zero
        this.scores = {
            total: 0.0,
            general: 0.0,
            environment: 0.0,
            social: 0.0,
            governance: 0.0
        };
        
        // Update UI to show no assessment state
        this.updateScoreDisplays();
        this.updateTrophyHighlighting();
        this.updateScoreDescription();
    }
    
    setupEventListeners() {
        // Proceed to SRI button
        document.getElementById('proceedToSRI')?.addEventListener('click', () => {
            this.navigateToPage('sustainability-index');
        });
        
        // Proceed to Carbon Calculator button
        document.getElementById('proceedToCarbonCalculator')?.addEventListener('click', () => {
            this.navigateToPage('carbon-calculator');
        });
        
        // Learn More buttons for SDG goals
        document.querySelectorAll('.learn-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.sdg-goal-card');
                const isPrimary = card.classList.contains('primary-goal');
                this.showSDGDetails(isPrimary ? 'primary' : 'secondary');
            });
        });
        
        // Add click handlers for category scores
        document.querySelectorAll('.category-score').forEach(score => {
            score.addEventListener('click', () => {
                const label = score.querySelector('.category-label').textContent;
                this.showCategoryDetails(label);
            });
        });
    }
    
    initializeCircularProgress() {
        this.updateMainProgressCircle();
        this.updateMiniProgressCircles();
    }
    
    updateMainProgressCircle() {
        const circle = document.querySelector('.progress-circle');
        if (!circle) return;
        
        const percentage = this.scores.total;
        const degrees = (percentage / 100) * 360;
        
        circle.style.background = `conic-gradient(
            var(--accent-green) 0deg ${degrees}deg,
            var(--bg-tertiary) ${degrees}deg 360deg
        )`;
    }
    
    updateMiniProgressCircles() {
        document.querySelectorAll('.mini-circle').forEach(circle => {
            const category = circle.getAttribute('data-category');
            let score = 0;
            
            if (category && this.scores[category] !== undefined) {
                score = this.scores[category];
            } else {
                score = parseFloat(circle.getAttribute('data-score'));
            }
            
            const degrees = (score / 100) * 360;
            
            circle.style.background = `conic-gradient(
                var(--accent-green) 0deg ${degrees}deg,
                var(--bg-tertiary) ${degrees}deg 360deg
            )`;
        });
    }
    
    updateScoreDisplays() {
        // Update total score
        const totalScoreElement = document.getElementById('totalScore');
        if (totalScoreElement) {
            totalScoreElement.textContent = this.scores.total.toFixed(1);
        }
        
        // Update score description
        this.updateScoreDescription();
        
        // Update mini scores
        document.querySelectorAll('.mini-score').forEach(score => {
            const circle = score.closest('.mini-circle');
            const category = circle.getAttribute('data-category');
            if (category && this.scores[category] !== undefined) {
                score.textContent = `${this.scores[category].toFixed(1)}%`;
            } else {
                const scoreValue = parseFloat(circle.getAttribute('data-score'));
                score.textContent = `${scoreValue.toFixed(1)}%`;
            }
        });

        // Update progress circles
        this.updateMainProgressCircle();
        this.updateMiniProgressCircles();

        // Update trophy highlighting based on score
        this.updateTrophyHighlighting();
    }
    
    getScoreDescription(score) {
        if (score >= 90) {
            return "Excellent sustainability performance with comprehensive practices and strong leadership in environmental, social, and governance areas.";
        } else if (score >= 80) {
            return "Have a good understanding of sustainability and there are processes in place to practice the requirements of sustainability.";
        } else if (score >= 70) {
            return "Basic understanding of sustainability with some processes in place, but significant room for improvement.";
        } else if (score >= 60) {
            return "Limited sustainability awareness with minimal processes in place. Immediate action required.";
        } else {
            return "Very limited sustainability understanding. Comprehensive sustainability program development needed.";
        }
    }

    updateTrophyHighlighting() {
        const totalScore = this.scores.total;
        
        // Remove all active classes first
        document.querySelectorAll('.trophy-item').forEach(trophy => {
            trophy.classList.remove('trophy-active');
        });

        // Only highlight trophy if assessment is completed and score is greater than 0
        if (this.hasAssessment && totalScore > 0) {
            if (totalScore >= 75) {
                // Champion level (75-100%)
                const championTrophy = document.querySelector('.trophy-champion');
                if (championTrophy) {
                    championTrophy.classList.add('trophy-active');
                }
            } else if (totalScore >= 50) {
                // Leader level (50-74%)
                const leaderTrophy = document.querySelector('.trophy-leader');
                if (leaderTrophy) {
                    leaderTrophy.classList.add('trophy-active');
                }
            } else if (totalScore >= 25) {
                // Advocate level (25-49%)
                const advocateTrophy = document.querySelector('.trophy-advocate');
                if (advocateTrophy) {
                    advocateTrophy.classList.add('trophy-active');
                }
            }
        }
        // If no assessment or score is 0 or below 25, no trophy is highlighted
    }

    updateScoreDescription() {
        const scoreDescription = document.getElementById('scoreDescription');
        if (!scoreDescription) return;

        const hasAssessment = this.userData?.has_sri_assessment || false;
        const totalScore = this.scores.total;

        if (!hasAssessment || totalScore === 0) {
            scoreDescription.textContent = "Complete the Sustainability Readiness Index assessment to get your personalized score and recommendations.";
        } else {
            scoreDescription.textContent = this.getScoreDescription(totalScore);
        }
    }
    
    updateAchievementDisplay() {
        const medalText = document.querySelector('.medal-text');
        if (medalText) {
            medalText.textContent = this.achievements.medal;
        }
        
        // Add achievement badges if needed
        this.displayAchievementBadges();
    }
    
    displayAchievementBadges() {
        const achievementSection = document.querySelector('.achievement-section');
        if (!achievementSection) return;
        
        // Create badges container if it doesn't exist
        let badgesContainer = achievementSection.querySelector('.achievement-badges');
        if (!badgesContainer) {
            badgesContainer = document.createElement('div');
            badgesContainer.className = 'achievement-badges';
            badgesContainer.style.cssText = `
                display: flex;
                gap: 8px;
                margin-top: 12px;
                flex-wrap: wrap;
                justify-content: center;
            `;
            achievementSection.appendChild(badgesContainer);
        }
        
        // Clear existing badges
        badgesContainer.innerHTML = '';
        
        // Add badges
        this.achievements.badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'achievement-badge';
            badgeElement.textContent = badge;
            badgeElement.style.cssText = `
                background-color: var(--accent-green-bg);
                color: var(--accent-green-text);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
            `;
            badgesContainer.appendChild(badgeElement);
        });
    }
    
    loadCompanyData() {
        // Load company-specific data from localStorage or API
        const companyData = localStorage.getItem('companyProfile');
        if (companyData) {
            const profile = JSON.parse(companyData);
            this.updateCompanySpecificData(profile);
        } else {
            // Generate mock company data
            this.generateMockCompanyData();
        }
    }
    
    generateMockCompanyData() {
        const mockData = {
            companyName: "EcoTech Solutions",
            industry: "Technology",
            size: "Medium (50-200 employees)",
            location: "San Francisco, CA",
            sustainabilityFocus: ["Renewable Energy", "Waste Reduction", "Employee Wellbeing"],
            lastAssessment: "2024-01-15",
            nextAssessment: "2024-04-15"
        };
        
        localStorage.setItem('companyProfile', JSON.stringify(mockData));
        this.updateCompanySpecificData(mockData);
    }
    
    updateCompanySpecificData(profile) {
        // Update SDG recommendations based on company profile
        this.updateSDGRecommendations(profile);
        
        // Update achievement text with company name
        const medalText = document.querySelector('.medal-text');
        if (medalText && profile.companyName) {
            medalText.textContent = `${profile.companyName} - ${this.achievements.medal}`;
        }
    }
    
    updateSDGRecommendations(profile) {
        // Customize SDG recommendations based on company profile
        if (profile.industry === 'Technology') {
            this.sdgRecommendations.primary = {
                goal: 7,
                title: "Affordable and Clean Energy",
                description: "Goals that are relevant with immediate opportunities",
                icon: "⚡",
                color: "#ffc107"
            };
            this.sdgRecommendations.secondary = {
                goal: 13,
                title: "Climate Action",
                description: "Goals that are relevant with long term opportunities",
                icon: "🌍",
                color: "#4caf50"
            };
        }
        
        // Update SDG cards with new data
        this.updateSDGCards();
    }
    
    updateSDGCards() {
        // Update primary goal
        const primaryCard = document.querySelector('.primary-goal');
        if (primaryCard) {
            const title = primaryCard.querySelector('h3');
            const description = primaryCard.querySelector('.sdg-description');
            const number = primaryCard.querySelector('.sdg-number');
            const symbol = primaryCard.querySelector('.sdg-symbol');
            
            if (title) title.textContent = this.sdgRecommendations.primary.title;
            if (description) description.textContent = this.sdgRecommendations.primary.description;
            if (number) number.textContent = this.sdgRecommendations.primary.goal;
            if (symbol) symbol.textContent = this.sdgRecommendations.primary.icon;
        }
        
        // Update secondary goal
        const secondaryCard = document.querySelector('.secondary-goal');
        if (secondaryCard) {
            const title = secondaryCard.querySelector('h3');
            const description = secondaryCard.querySelector('.sdg-description');
            const number = secondaryCard.querySelector('.sdg-number');
            const symbol = secondaryCard.querySelector('.sdg-symbol');
            
            if (title) title.textContent = this.sdgRecommendations.secondary.title;
            if (description) description.textContent = this.sdgRecommendations.secondary.description;
            if (number) number.textContent = this.sdgRecommendations.secondary.goal;
            if (symbol) symbol.textContent = this.sdgRecommendations.secondary.icon;
        }
    }
    
    navigateToPage(page) {
        // Use the navigation manager to navigate to different pages
        if (window.navigationManager) {
            window.navigationManager.navigateTo(page);
        } else {
            // Fallback navigation
            const pageMap = {
                'sustainability-index': '/sustainability-index',
                'carbon-calculator': '/carbon-calculator',
                'recommended-sdgs': '/recommended-sdgs',
                'data-center': '/data-center'
            };
            
            if (pageMap[page]) {
                window.location.href = pageMap[page];
            }
        }
    }
    
    showSDGDetails(type) {
        const recommendation = type === 'primary' ? this.sdgRecommendations.primary : this.sdgRecommendations.secondary;
        
        const modal = document.createElement('div');
        modal.className = 'sdg-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>SDG ${recommendation.goal}: ${recommendation.title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="sdg-icon-large" style="background-color: ${recommendation.color};">
                            <span class="sdg-number-large">${recommendation.goal}</span>
                            <span class="sdg-symbol-large">${recommendation.icon}</span>
                        </div>
                        <p>${recommendation.description}</p>
                        <div class="modal-actions">
                            <button class="btn-primary" onclick="window.location.href='/recommended-sdgs'">
                                View Full Assessment
                            </button>
                            <button class="btn-secondary modal-close">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                background-color: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .modal-content {
                background-color: var(--bg-card);
                border-radius: 12px;
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--border-primary);
            }
            .modal-header h2 {
                color: var(--text-primary);
                margin: 0;
                font-size: 20px;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body {
                padding: 20px;
                text-align: center;
            }
            .sdg-icon-large {
                width: 100px;
                height: 100px;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
            }
            .sdg-number-large {
                color: white;
                font-size: 32px;
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            .sdg-symbol-large {
                font-size: 24px;
                margin-top: 4px;
            }
            .modal-body p {
                color: var(--text-secondary);
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 20px;
            }
            .modal-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            });
        });
        
        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }
    
    showCategoryDetails(category) {
        const score = this.scores[category.toLowerCase()];
        const description = this.getCategoryDescription(category, score);
        
        this.showNotification(`${category}: ${score}% - ${description}`, 'info');
    }
    
    getCategoryDescription(category, score) {
        const descriptions = {
            'General': {
                high: 'Strong foundational sustainability practices',
                medium: 'Basic sustainability awareness',
                low: 'Limited sustainability understanding'
            },
            'Environment': {
                high: 'Excellent environmental stewardship',
                medium: 'Moderate environmental practices',
                low: 'Needs environmental improvement'
            },
            'Social': {
                high: 'Strong social responsibility',
                medium: 'Basic social practices',
                low: 'Social responsibility gaps'
            },
            'Governance': {
                high: 'Excellent governance practices',
                medium: 'Adequate governance structure',
                low: 'Governance improvements needed'
            }
        };
        
        const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
        return descriptions[category][level];
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--bg-card);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            color: var(--text-primary);
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Public methods for external updates
    updateScores(newScores) {
        this.scores = { ...this.scores, ...newScores };
        this.updateScoreDisplays();
        this.initializeCircularProgress();
    }
    
    addAchievement(achievement) {
        this.achievements.badges.push(achievement);
        this.displayAchievementBadges();
    }
    
    updateSDGRecommendations(newRecommendations) {
        this.sdgRecommendations = { ...this.sdgRecommendations, ...newRecommendations };
        this.updateSDGCards();
    }
    
    updateScoreDisplays() {
        // Update total score display
        const totalScoreElement = document.getElementById('totalScore');
        if (totalScoreElement) {
            totalScoreElement.textContent = this.scores.total.toFixed(1);
        }
        
        // Update category scores
        const categories = ['general', 'environment', 'social', 'governance'];
        categories.forEach(category => {
            const scoreElement = document.querySelector(`[data-category="${category}"] .mini-score`);
            if (scoreElement) {
                scoreElement.textContent = `${this.scores[category].toFixed(1)}%`;
            }
        });
    }
    
    updateSDGDisplay() {
        // Update SDG recommendations display
        const primaryGoal = document.querySelector('.primary-goal');
        const secondaryGoal = document.querySelector('.secondary-goal');
        
        if (primaryGoal && this.sdgRecommendations.primary) {
            const title = primaryGoal.querySelector('h3');
            const description = primaryGoal.querySelector('.sdg-description');
            const number = primaryGoal.querySelector('.sdg-number');
            
            if (title) title.textContent = this.sdgRecommendations.primary.title;
            if (description) description.textContent = this.sdgRecommendations.primary.description;
            if (number) number.textContent = this.sdgRecommendations.primary.goal;
        }
        
        if (secondaryGoal && this.sdgRecommendations.secondary) {
            const title = secondaryGoal.querySelector('h3');
            const description = secondaryGoal.querySelector('.sdg-description');
            const number = secondaryGoal.querySelector('.sdg-number');
            
            if (title) title.textContent = this.sdgRecommendations.secondary.title;
            if (description) description.textContent = this.sdgRecommendations.secondary.description;
            if (number) number.textContent = this.sdgRecommendations.secondary.goal;
        }
    }
}

// Initialize Dashboard Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});