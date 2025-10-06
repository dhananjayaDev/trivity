/**
 * Clean SRI Assessment Manager
 * Handles sustainability readiness index assessment with proper AI integration
 */

class SRIAssessmentManager {
    constructor() {
        this.totalQuestions = 27;
        this.answeredQuestions = 0;
        this.scores = {
            general: 0,
            environment: 0,
            social: 0,
            governance: 0
        };
        this.questionCounts = {
            general: 4,
            environment: 5,
            social: 8,
            governance: 10
        };
        this.answers = {};
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.updateSectionScores();
    }
    
    setupEventListeners() {
        // Add event listeners to all radio buttons
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleAnswerChange(e));
        });
        
        // Submit button event listener
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAssessment());
        }
    }
    
    
    handleAnswerChange(event) {
        const radio = event.target;
        const category = radio.getAttribute('data-category');
        const questionName = radio.getAttribute('name');
        
        // Store answer
        this.answers[questionName] = radio.value;
        
        // Count answered questions
        this.updateAnsweredCount();
        
        // Update section scores
        this.updateSectionScores();
        
        // Update progress
        this.updateProgress();
        
        // Enable/disable submit button
        this.updateSubmitButton();
    }
    
    updateAnsweredCount() {
        const answeredRadios = document.querySelectorAll('input[type="radio"]:checked');
        this.answeredQuestions = answeredRadios.length;
    }
    
    updateSectionScores() {
        const categories = ['general', 'environment', 'social', 'governance'];
        
        categories.forEach(category => {
            const answeredInCategory = document.querySelectorAll(`input[data-category="${category}"]:checked`);
            const scoreElement = document.getElementById(`${category}-score`);
            
            if (scoreElement) {
                scoreElement.textContent = `${answeredInCategory.length}/${this.questionCounts[category]}`;
            }
        });
    }
    
    updateProgress() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (progressText) {
            progressText.textContent = `${this.answeredQuestions} of ${this.totalQuestions} questions completed`;
        }
        
        if (progressFill) {
            const percentage = (this.answeredQuestions / this.totalQuestions) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }
    
    updateSubmitButton() {
        const submitBtn = document.getElementById('submitBtn');
        const isComplete = this.answeredQuestions === this.totalQuestions;
        
        if (submitBtn) {
            submitBtn.disabled = !isComplete;
            
            if (isComplete) {
                submitBtn.classList.add('enabled');
            } else {
                submitBtn.classList.remove('enabled');
            }
        }
    }
    
    
    validateAnswers() {
        const missingAnswers = [];
        const categories = ['general', 'environment', 'social', 'governance'];
        
        categories.forEach(category => {
            const categoryQuestions = document.querySelectorAll(`input[data-category="${category}"]`);
            const answeredQuestions = document.querySelectorAll(`input[data-category="${category}"]:checked`);
            
            if (answeredQuestions.length < this.questionCounts[category]) {
                missingAnswers.push(category);
            }
        });
        
        return missingAnswers;
    }
    
    showLoading(message) {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <span class="material-icons spinning">refresh</span>
                ${message}
            `;
            submitBtn.disabled = true;
        }
    }
    
    hideLoading() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <span class="material-icons">assessment</span>
                Submit Assessment
            `;
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="material-icons">${type === 'error' ? 'error' : 'info'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    async submitAssessment() {
        if (this.answeredQuestions !== this.totalQuestions) {
            this.showError('Please complete all questions before submitting.');
            return;
        }

        if (this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.showLoading('Submitting Assessment...');

        try {
            // Debug: Log what we're sending
            console.log('Submitting assessment with answers:', this.answers);
            
            // Submit to SRI API with default context
            const response = await fetch('/api/sri/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: this.answers,
                    context: {
                        industry: 'General',
                        company_size: 'Not specified',
                        location: 'Global'
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                this.hideLoading();
                this.showSuccess('Assessment submitted successfully!');
                
                // Clear any cached data
                this.clearCache();
                
                // Redirect to dashboard immediately
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to submit assessment');
            }

        } catch (error) {
            console.error('Error submitting assessment:', error);
            this.hideLoading();
            this.showError(`Failed to submit assessment: ${error.message}`);
        } finally {
            this.isSubmitting = false;
        }
    }
    
    clearCache() {
        // Clear any cached data in localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('sri_') || key.startsWith('assessment_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear any cached data in sessionStorage
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
            if (key.startsWith('sri_') || key.startsWith('assessment_')) {
                sessionStorage.removeItem(key);
            }
        });
    }
    
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sriAssessmentManager = new SRIAssessmentManager();
});

// Add CSS for notifications and modal
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .notification.success {
        background: #4caf50;
    }
    
    .notification.error {
        background: #f44336;
    }
    
    .notification.info {
        background: #2196f3;
    }
    
    .spinning {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .context-form {
        background: var(--card-background);
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        border: 1px solid var(--border-color);
    }
    
    .context-form h3 {
        margin: 0 0 20px 0;
        color: var(--text-primary);
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--input-background);
        color: var(--text-primary);
    }
    
    .results-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: var(--card-background);
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .score-display {
        text-align: center;
    }
    
    .total-score {
        margin-bottom: 20px;
    }
    
    .score-value {
        font-size: 3rem;
        font-weight: bold;
        color: var(--primary-color);
    }
    
    .score-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 10px;
    }
    
    .score-item {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        background: var(--background-secondary);
        border-radius: 6px;
    }
    
    .trophy {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: center;
        padding: 15px;
        background: var(--background-secondary);
        border-radius: 8px;
        margin-top: 15px;
    }
    
    .trophy.champion {
        color: #ffd700;
    }
    
    .trophy.leader {
        color: #c0c0c0;
    }
    
    .trophy.advocate {
        color: #cd7f32;
    }
    
    .close-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
    }
    
    .context-form {
        background: var(--card-background, #ffffff);
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        border: 1px solid var(--border-color, #e0e0e0);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .context-form h3 {
        margin: 0 0 20px 0;
        color: var(--text-primary, #333333);
        font-size: 1.2rem;
        font-weight: 600;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: var(--text-secondary, #666666);
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 6px;
        background: var(--input-background, #ffffff);
        color: var(--text-primary, #333333);
        font-size: 0.9rem;
        transition: border-color 0.2s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: var(--primary-color, #4caf50);
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
    }
    
    .submit-assessment-btn.enabled {
        background: var(--primary-color, #4caf50);
        color: white;
        cursor: pointer;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
    
    .submit-assessment-btn:disabled {
        background: var(--disabled-color, #cccccc);
        color: var(--text-disabled, #999999);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
    
    .submit-note {
        color: var(--text-secondary, #666666);
        font-size: 0.85rem;
        margin-top: 8px;
        text-align: center;
    }
`;
document.head.appendChild(style);