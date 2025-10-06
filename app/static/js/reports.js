/**
 * Reports Manager
 * Handles report generation and download functionality
 */

class ReportsManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadReportHistory();
        this.loadAIInsights();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Refresh reports button
        document.getElementById('refreshReports')?.addEventListener('click', () => {
            this.refreshReports();
        });
        
        // Generate all reports button
        document.getElementById('generateAllReports')?.addEventListener('click', () => {
            this.generateAllReports();
        });
        
        console.log('Reports manager initialized');
    }
    
    async loadReportHistory() {
        try {
            // Load user data to get last report dates
            const response = await fetch('/api/dashboard/data');
            const result = await response.json();
            
            if (result.success) {
                this.updateReportHistory(result.data);
            }
        } catch (error) {
            console.error('Error loading report history:', error);
        }
    }
    
    updateReportHistory(data) {
        // Update last assessment date
        if (data.user_progress && data.user_progress.latest_assessment) {
            const assessmentDate = new Date(data.user_progress.latest_assessment.created_at);
            document.getElementById('lastAssessmentDate').textContent = assessmentDate.toLocaleDateString();
        }
        
        // Update last carbon date
        if (data.user_progress && data.user_progress.latest_carbon) {
            const carbonDate = new Date(data.user_progress.latest_carbon.created_at);
            document.getElementById('lastCarbonDate').textContent = carbonDate.toLocaleDateString();
        }
        
        // Update last SDG date
        if (data.user_progress && data.user_progress.latest_sdg) {
            const sdgDate = new Date(data.user_progress.latest_sdg.generated_at);
            document.getElementById('lastSDGDate').textContent = sdgDate.toLocaleDateString();
        }
    }
    
    async loadAIInsights() {
        try {
            const response = await fetch('/api/dashboard/data');
            const result = await response.json();
            
            if (result.success) {
                this.displayAIInsights(result.data);
            } else {
                this.showNoDataInsights();
            }
        } catch (error) {
            console.error('Error loading AI insights:', error);
            this.showErrorInsights();
        }
    }
    
    displayAIInsights(data) {
        const insightsContainer = document.getElementById('insightsContent');
        if (!insightsContainer) return;
        
        insightsContainer.innerHTML = '';
        
        if (data.ai_analysis && Object.keys(data.ai_analysis).length > 0) {
            // Show AI-generated insights
            const insights = data.ai_analysis;
            
            // Overall assessment
            if (insights.overall_assessment) {
                this.addInsightCard(insightsContainer, 'assessment', 'Overall Assessment', insights.overall_assessment);
            }
            
            // Key insights
            if (insights.key_insights && Array.isArray(insights.key_insights)) {
                insights.key_insights.slice(0, 3).forEach((insight, index) => {
                    this.addInsightCard(insightsContainer, 'lightbulb', `Key Insight ${index + 1}`, insight);
                });
            }
            
            // Recommendations
            if (insights.recommendations && Array.isArray(insights.recommendations)) {
                insights.recommendations.slice(0, 2).forEach((rec, index) => {
                    this.addInsightCard(insightsContainer, 'recommendation', `Recommendation ${index + 1}`, rec);
                });
            }
            
            // Priority areas
            if (insights.priority_areas && Array.isArray(insights.priority_areas)) {
                const priorityText = insights.priority_areas.join(', ');
                this.addInsightCard(insightsContainer, 'priority', 'Priority Areas', priorityText);
            }
        } else {
            this.showNoDataInsights();
        }
    }
    
    addInsightCard(container, icon, title, content) {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <div class="insight-card-header">
                <span class="material-icons">${icon}</span>
                <h4>${title}</h4>
            </div>
            <div class="insight-card-content">
                <p>${content}</p>
            </div>
        `;
        container.appendChild(card);
    }
    
    showNoDataInsights() {
        const insightsContainer = document.getElementById('insightsContent');
        if (!insightsContainer) return;
        
        insightsContainer.innerHTML = `
            <div class="no-data-insights">
                <span class="material-icons">info</span>
                <h3>No AI Insights Available</h3>
                <p>Complete your sustainability assessment to unlock personalized AI insights and recommendations.</p>
                <button class="btn-primary" onclick="window.location.href='/sustainability-index'">
                    <span class="material-icons">assessment</span>
                    Start Assessment
                </button>
            </div>
        `;
    }
    
    showErrorInsights() {
        const insightsContainer = document.getElementById('insightsContent');
        if (!insightsContainer) return;
        
        insightsContainer.innerHTML = `
            <div class="error-insights">
                <span class="material-icons">error</span>
                <h3>Unable to Load Insights</h3>
                <p>There was an error loading AI insights. Please try refreshing the page.</p>
                <button class="btn-secondary" onclick="location.reload()">
                    <span class="material-icons">refresh</span>
                    Refresh Page
                </button>
            </div>
        `;
    }
    
    async refreshReports() {
        const refreshBtn = document.getElementById('refreshReports');
        if (refreshBtn) {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<span class="material-icons">refresh</span> Refreshing...';
            refreshBtn.disabled = true;
            
            try {
                await this.loadReportHistory();
                await this.loadAIInsights();
                
                refreshBtn.innerHTML = '<span class="material-icons">check</span> Refreshed';
                setTimeout(() => {
                    refreshBtn.innerHTML = originalText;
                    refreshBtn.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Error refreshing reports:', error);
                refreshBtn.innerHTML = '<span class="material-icons">error</span> Error';
                setTimeout(() => {
                    refreshBtn.innerHTML = originalText;
                    refreshBtn.disabled = false;
                }, 2000);
            }
        }
    }
    
    async generateAllReports() {
        const generateBtn = document.getElementById('generateAllReports');
        if (generateBtn) {
            const originalText = generateBtn.innerHTML;
            generateBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Generating...';
            generateBtn.disabled = true;
            
            try {
                // Generate all report types
                const reportTypes = ['assessment', 'carbon', 'sdg', 'comprehensive'];
                const promises = reportTypes.map(type => this.generateReport(type, 'excel'));
                
                await Promise.all(promises);
                
                generateBtn.innerHTML = '<span class="material-icons">check</span> Generated';
                setTimeout(() => {
                    generateBtn.innerHTML = originalText;
                    generateBtn.disabled = false;
                }, 3000);
            } catch (error) {
                console.error('Error generating all reports:', error);
                generateBtn.innerHTML = '<span class="material-icons">error</span> Error';
                setTimeout(() => {
                    generateBtn.innerHTML = originalText;
                    generateBtn.disabled = false;
                }, 2000);
            }
        }
    }
}

// Global function for report generation
async function generateReport(reportType, format) {
    try {
        // Show loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'flex';
        
        // Generate report
        const response = await fetch(`/api/reports/${reportType}?format=${format}`);
        
        if (response.ok) {
            // Get filename from response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${reportType}_report.${format === 'excel' ? 'xlsx' : 'csv'}`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Show success message
            showNotification('Report generated successfully!', 'success');
            
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate report');
        }
        
    } catch (error) {
        console.error('Report generation error:', error);
        showNotification(`Error generating report: ${error.message}`, 'error');
    } finally {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'none';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
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
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

// Initialize reports manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});
