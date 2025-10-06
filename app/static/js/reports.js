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
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add any additional event listeners here
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
