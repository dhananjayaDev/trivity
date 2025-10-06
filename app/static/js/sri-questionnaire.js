/**
 * SRI Questionnaire Manager
 * Handles the Sustainability Readiness Index questionnaire
 */

class SRIQuestionnaire {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.context = {};
        this.isSubmitting = false;

        this.init();
    }

    async init() {
        try {
            await this.loadQuestions();
            this.setupEventListeners();
            this.displayCurrentQuestion();
            this.updateProgress();
        } catch (error) {
            console.error('Error initializing SRI questionnaire:', error);
            this.showError('Failed to load questionnaire. Please refresh the page.');
        }
    }

    async loadQuestions() {
        try {
            const response = await fetch('/api/sri/questions');
            const data = await response.json();

            if (data.success) {
                this.questions = data.questions;
                console.log('Loaded questions:', this.questions.length);
            } else {
                throw new Error(data.error || 'Failed to load questions');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitAssessment());

        // Context form inputs
        document.getElementById('industry').addEventListener('change', () => this.updateContext());
        document.getElementById('companySize').addEventListener('change', () => this.updateContext());
        document.getElementById('location').addEventListener('input', () => this.updateContext());
    }

    updateContext() {
        this.context = {
            industry: document.getElementById('industry').value,
            company_size: document.getElementById('companySize').value,
            location: document.getElementById('location').value
        };
    }

    displayCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showCompletion();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const container = document.getElementById('questionsContainer');

        container.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-number">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</div>
                    <div class="question-text">${question.text}</div>
                    <div class="question-category">${question.category.toUpperCase()}</div>
                </div>
                <div class="options-container">
                    ${this.renderOptions(question)}
                </div>
            </div>
        `;

        // Add event listeners to options
        this.setupOptionListeners(question);
        this.updateNavigationButtons();
    }

    renderOptions(question) {
        return question.options.map((option, index) => `
            <div class="option-item" data-value="${option.value}">
                <input type="radio" 
                       class="option-radio" 
                       name="question_${question.id}" 
                       value="${option.value}" 
                       id="option_${question.id}_${index}"
                       ${this.answers[question.id] === option.value ? 'checked' : ''}>
                <label for="option_${question.id}_${index}" class="option-text">
                    ${option.text}
                </label>
            </div>
        `).join('');
    }

    setupOptionListeners(question) {
        const optionItems = document.querySelectorAll('.option-item');
        optionItems.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const radio = item.querySelector('input[type="radio"]');
                
                // Update visual state
                optionItems.forEach(opt => opt.classList.remove('selected'));
                item.classList.add('selected');
                radio.checked = true;

                // Save answer
                this.answers[question.id] = value;
                this.updateNavigationButtons();
            });
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Previous button
        prevBtn.disabled = this.currentQuestionIndex === 0;

        // Next/Submit button
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const hasAnswer = currentQuestion && this.answers[currentQuestion.id];

        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
            submitBtn.disabled = !hasAnswer || this.isSubmitting;
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
            nextBtn.disabled = !hasAnswer;
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
            this.updateProgress();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
            this.updateProgress();
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    showCompletion() {
        const container = document.getElementById('questionsContainer');
        container.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <h2>Assessment Complete!</h2>
                    <p>Thank you for completing the Sustainability Readiness Index questionnaire.</p>
                </div>
            </div>
        `;

        // Hide navigation buttons
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'flex';
    }

    async submitAssessment() {
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.showLoading('Submitting Assessment...');

        try {
            // Validate required fields
            const missingAnswers = this.validateAnswers();
            if (missingAnswers.length > 0) {
                this.hideLoading();
                this.showError(`Please answer all required questions: ${missingAnswers.join(', ')}`);
                this.isSubmitting = false;
                return;
            }

            // Validate context
            if (!this.context.industry || !this.context.company_size || !this.context.location) {
                this.hideLoading();
                this.showError('Please fill in all organization context fields.');
                this.isSubmitting = false;
                return;
            }

            // Submit assessment
            const response = await fetch('/api/sri/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: this.answers,
                    context: this.context
                })
            });

            const result = await response.json();

            if (result.success) {
                this.hideLoading();
                this.showSuccess('Assessment submitted successfully!');
                
                // Redirect to results or dashboard after a delay
                setTimeout(() => {
                    window.location.href = '/sustainability-index';
                }, 2000);
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

    validateAnswers() {
        const missingAnswers = [];
        
        this.questions.forEach(question => {
            if (question.required && !this.answers[question.id]) {
                missingAnswers.push(`Question ${this.questions.indexOf(question) + 1}`);
            }
        });

        return missingAnswers;
    }

    showLoading(message) {
        document.getElementById('loadingMessage').textContent = message;
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize questionnaire when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SRIQuestionnaire();
});
