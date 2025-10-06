/**
 * AI Service Integration for Trivity Sustainability Platform
 * Handles AI-powered features and real-time updates
 */

class AIService {
    constructor() {
        this.baseUrl = '/api';
        this.isAvailable = false;
        this.init();
    }
    
    async init() {
        try {
            const response = await fetch(`${this.baseUrl}/ai/status`);
            const data = await response.json();
            this.isAvailable = data.ai_available;
            console.log(`AI Service ${this.isAvailable ? 'available' : 'in fallback mode'}`);
        } catch (error) {
            console.error('Failed to check AI status:', error);
            this.isAvailable = false;
        }
    }
    
    /**
     * Analyze sustainability assessment with AI
     */
    async analyzeAssessment(answers, userProfile = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/assessment/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: answers,
                    industry: userProfile.industry || 'Not specified',
                    size: userProfile.size || 'Not specified',
                    location: userProfile.location || 'Not specified'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    analysis: data.analysis,
                    assessmentId: data.assessment_id
                };
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Assessment analysis error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get AI-powered SDG recommendations
     */
    async getSDGRecommendations() {
        try {
            const response = await fetch(`${this.baseUrl}/sdg/recommendations`);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    recommendations: data.recommendations
                };
            } else {
                throw new Error(data.error || 'Failed to get recommendations');
            }
        } catch (error) {
            console.error('SDG recommendations error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Analyze carbon footprint with AI
     */
    async analyzeCarbonFootprint(carbonData, userProfile = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/carbon/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    carbon_data: carbonData,
                    industry: userProfile.industry || 'Not specified',
                    size: userProfile.size || 'Not specified'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    analysis: data.analysis,
                    carbonId: data.carbon_id
                };
            } else {
                throw new Error(data.error || 'Carbon analysis failed');
            }
        } catch (error) {
            console.error('Carbon analysis error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get AI-powered dashboard insights
     */
    async getDashboardInsights() {
        try {
            const response = await fetch(`${this.baseUrl}/insights/dashboard`);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    insights: data.insights
                };
            } else {
                throw new Error(data.error || 'Failed to get insights');
            }
        } catch (error) {
            console.error('Dashboard insights error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get user progress
     */
    async getUserProgress() {
        try {
            const response = await fetch(`${this.baseUrl}/user/progress`);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    progress: data.progress
                };
            } else {
                throw new Error(data.error || 'Failed to get progress');
            }
        } catch (error) {
            console.error('User progress error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update dashboard with AI insights
     */
    async updateDashboardWithAI() {
        try {
            // Get dashboard insights
            const insightsResult = await this.getDashboardInsights();
            if (insightsResult.success) {
                this.displayAIInsights(insightsResult.insights);
            }
            
            // Get user progress
            const progressResult = await this.getUserProgress();
            if (progressResult.success) {
                this.displayUserProgress(progressResult.progress);
            }
            
            // Get SDG recommendations
            const sdgResult = await this.getSDGRecommendations();
            if (sdgResult.success) {
                this.updateSDGRecommendations(sdgResult.recommendations);
            }
            
            // Get real dashboard data
            const dashboardResult = await this.getDashboardData();
            if (dashboardResult.success) {
                this.updateDashboardWithRealData(dashboardResult.data);
            }
            
        } catch (error) {
            console.error('Dashboard update error:', error);
        }
    }
    
    /**
     * Get real dashboard data
     */
    async getDashboardData() {
        try {
            const response = await fetch(`${this.baseUrl}/dashboard/data`);
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    data: data.data
                };
            } else {
                throw new Error(data.error || 'Failed to get dashboard data');
            }
        } catch (error) {
            console.error('Dashboard data error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update dashboard with real data
     */
    updateDashboardWithRealData(dashboardData) {
        // Update SRI scores
        if (dashboardData.sri_scores) {
            this.updateSRIScores(dashboardData.sri_scores);
        }
        
        // Update carbon data
        if (dashboardData.carbon_data) {
            this.updateCarbonData(dashboardData.carbon_data);
        }
        
        // Update SDG recommendations
        if (dashboardData.sdg_recommendations) {
            this.updateSDGRecommendations(dashboardData.sdg_recommendations);
        }
        
        // Update user progress
        if (dashboardData.user_progress) {
            this.displayUserProgress(dashboardData.user_progress);
        }
    }
    
    /**
     * Update SRI scores with real data
     */
    updateSRIScores(sriScores) {
        // Update total score
        const totalScoreElement = document.getElementById('totalScore');
        if (totalScoreElement) {
            totalScoreElement.textContent = sriScores.total.toFixed(1);
        }
        
        // Update category scores
        const categoryElements = document.querySelectorAll('.mini-score');
        const categories = ['general', 'environment', 'social', 'governance'];
        
        categories.forEach((category, index) => {
            if (categoryElements[index] && sriScores.categories[category]) {
                categoryElements[index].textContent = `${sriScores.categories[category].toFixed(1)}%`;
            }
        });
        
        // Update circular progress
        this.updateCircularProgress(sriScores.total);
    }
    
    /**
     * Update circular progress
     */
    updateCircularProgress(score) {
        const progressCircle = document.querySelector('.progress-circle');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 70; // radius = 70
            const offset = circumference - (score / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }
    
    /**
     * Update carbon data display
     */
    updateCarbonData(carbonData) {
        // This would update carbon-related displays
        // For now, we'll just log the data
        console.log('Carbon data updated:', carbonData);
    }
    
    /**
     * Display AI insights on dashboard
     */
    displayAIInsights(insights) {
        // Update performance summary
        const summaryElement = document.getElementById('ai-performance-summary');
        if (summaryElement) {
            summaryElement.textContent = insights.performance_summary;
        }
        
        // Update achievements
        const achievementsElement = document.getElementById('ai-achievements');
        if (achievementsElement && insights.achievements) {
            achievementsElement.innerHTML = insights.achievements
                .map(achievement => `<li>${achievement}</li>`)
                .join('');
        }
        
        // Update attention areas
        const attentionElement = document.getElementById('ai-attention-areas');
        if (attentionElement && insights.attention_areas) {
            attentionElement.innerHTML = insights.attention_areas
                .map(area => `<li>${area}</li>`)
                .join('');
        }
        
        // Update recommendations
        const recommendationsElement = document.getElementById('ai-recommendations');
        if (recommendationsElement && insights.personalized_recommendations) {
            recommendationsElement.innerHTML = insights.personalized_recommendations
                .map(rec => `<li>${rec}</li>`)
                .join('');
        }
        
        // Update motivational message
        const messageElement = document.getElementById('ai-motivational-message');
        if (messageElement) {
            messageElement.textContent = insights.motivational_message;
        }
    }
    
    /**
     * Display user progress
     */
    displayUserProgress(progress) {
        const progressElement = document.getElementById('user-progress-bar');
        if (progressElement) {
            progressElement.style.width = `${progress.completion_percentage}%`;
        }
        
        const progressTextElement = document.getElementById('user-progress-text');
        if (progressTextElement) {
            progressTextElement.textContent = `${Math.round(progress.completion_percentage)}% Complete`;
        }
    }
    
    /**
     * Update SDG recommendations
     */
    updateSDGRecommendations(recommendations) {
        if (recommendations && recommendations.length >= 2) {
            const primaryGoal = recommendations[0];
            const secondaryGoal = recommendations[1];
            
            // Update primary goal
            const primaryCard = document.querySelector('.sdg-goal-card.primary-goal');
            if (primaryCard && primaryGoal) {
                const titleElement = primaryCard.querySelector('h3');
                const descElement = primaryCard.querySelector('.sdg-description');
                const numberElement = primaryCard.querySelector('.sdg-number');
                
                if (titleElement) titleElement.textContent = primaryGoal.title;
                if (descElement) descElement.textContent = primaryGoal.description;
                if (numberElement) numberElement.textContent = primaryGoal.number;
            }
            
            // Update secondary goal
            const secondaryCard = document.querySelector('.sdg-goal-card.secondary-goal');
            if (secondaryCard && secondaryGoal) {
                const titleElement = secondaryCard.querySelector('h3');
                const descElement = secondaryCard.querySelector('.sdg-description');
                const numberElement = secondaryCard.querySelector('.sdg-number');
                
                if (titleElement) titleElement.textContent = secondaryGoal.title;
                if (descElement) descElement.textContent = secondaryGoal.description;
                if (numberElement) numberElement.textContent = secondaryGoal.number;
            }
        }
    }
    
    /**
     * Show AI loading indicator
     */
    showAILoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="ai-loading"><span class="material-icons">psychology</span> AI is analyzing...</div>';
        }
    }
    
    /**
     * Hide AI loading indicator
     */
    hideAILoading(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
        }
    }
}

// Global AI service instance
window.aiService = new AIService();

// Initialize AI features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Update dashboard with AI insights
    if (window.location.pathname === '/') {
        window.aiService.updateDashboardWithAI();
    }
});
