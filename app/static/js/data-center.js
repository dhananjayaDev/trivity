/**
 * Data Center Management System
 * Handles analytics, project management, reporting, and data operations
 */

class DataCenterManager {
    constructor() {
        this.data = {
            sustainability: {
                score: 0,
                trend: '+5%',
                lastUpdate: new Date()
            },
            carbon: {
                footprint: 0,
                trend: '-12%',
                lastUpdate: new Date()
            },
            sdg: {
                goals: 0,
                trend: '+3',
                lastUpdate: new Date()
            },
            projects: {
                active: 0,
                completed: 0,
                trend: '+2',
                lastUpdate: new Date()
            }
        };
        
        this.charts = {};
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadMockData();
        this.initializeCharts();
        this.updateOverviewMetrics();
        this.generateMockProjects();
        this.generateMockReports();
    }
    
    setupEventListeners() {
        // Overview actions
        document.getElementById('refreshData')?.addEventListener('click', () => this.refreshData());
        document.getElementById('exportAllData')?.addEventListener('click', () => this.exportAllData());
        
        // Analytics controls
        document.getElementById('timePeriod')?.addEventListener('change', (e) => this.updateTimePeriod(e.target.value));
        
        // Chart controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleChartType(e.target));
        });
        
        // Project management
        document.getElementById('addProject')?.addEventListener('click', () => this.addNewProject());
        
        // Reporting
        document.getElementById('generateReport')?.addEventListener('click', () => this.generateReport());
        document.getElementById('scheduleReport')?.addEventListener('click', () => this.scheduleReport());
        
        // Data management
        document.getElementById('backupData')?.addEventListener('click', () => this.backupData());
        document.getElementById('importData')?.addEventListener('click', () => this.importData());
        document.getElementById('syncData')?.addEventListener('click', () => this.syncData());
        
        // Report actions
        document.querySelectorAll('.report-actions .btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => this.downloadReport(e.target));
        });
        
        document.querySelectorAll('.report-actions .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => this.viewReport(e.target));
        });
        
        // Project actions
        document.querySelectorAll('.project-actions .btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => this.updateProject(e.target));
        });
        
        document.querySelectorAll('.project-actions .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => this.viewProjectDetails(e.target));
        });
    }
    
    loadMockData() {
        // Load mock data from localStorage or generate new data
        const storedData = localStorage.getItem('sustainabilityData');
        if (storedData) {
            this.data = { ...this.data, ...JSON.parse(storedData) };
        } else {
            this.generateMockData();
        }
    }
    
    toggleChartType(button) {
        // Remove active class from all buttons
        document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const chartType = button.dataset.chart;
        if (chartType === 'bar') {
            this.createCarbonChart(); // Re-render as bar chart
        } else if (chartType === 'line') {
            this.createCarbonLineChart(); // Create line chart version
        }
    }
    
    generateMockData() {
        // Generate realistic mock data
        this.data.sustainability.score = Math.floor(Math.random() * 40) + 60; // 60-100%
        this.data.carbon.footprint = (Math.random() * 50 + 10).toFixed(2); // 10-60 tCO₂e
        this.data.sdg.goals = Math.floor(Math.random() * 8) + 3; // 3-10 goals
        this.data.projects.active = Math.floor(Math.random() * 5) + 2; // 2-6 projects
        
        // Save to localStorage
        localStorage.setItem('sustainabilityData', JSON.stringify(this.data));
    }
    
    updateOverviewMetrics() {
        // Update sustainability score
        document.getElementById('sustainabilityScore').textContent = `${this.data.sustainability.score}%`;
        document.getElementById('sustainabilityTrend').innerHTML = `
            <span class="material-icons">trending_up</span>
            <span>${this.data.sustainability.trend} from last month</span>
        `;
        
        // Update carbon footprint
        document.getElementById('carbonFootprint').textContent = `${this.data.carbon.footprint} tCO₂e`;
        document.getElementById('carbonTrend').innerHTML = `
            <span class="material-icons">trending_down</span>
            <span>${this.data.carbon.trend} from last month</span>
        `;
        
        // Update SDG goals
        document.getElementById('sdgGoals').textContent = this.data.sdg.goals;
        document.getElementById('sdgTrend').innerHTML = `
            <span class="material-icons">add</span>
            <span>${this.data.sdg.trend} new goals this month</span>
        `;
        
        // Update active projects
        document.getElementById('activeProjects').textContent = this.data.projects.active;
        document.getElementById('projectsTrend').innerHTML = `
            <span class="material-icons">play_arrow</span>
            <span>${this.data.projects.trend} completed this week</span>
        `;
    }
    
    initializeCharts() {
        this.createSustainabilityChart();
        this.createCarbonChart();
        this.createSDGChart();
        this.createProjectsChart();
    }
    
    createSustainabilityChart() {
        const container = document.getElementById('sustainabilityChart');
        if (!container) return;
        
        const data = {
            environment: 91,
            social: 63,
            governance: 90
        };
        
        const avgScore = Math.round((data.environment + data.social + data.governance) / 3);
        
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 64px; font-weight: 800; background: linear-gradient(135deg, var(--accent-green), var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 24px;">
                    ${avgScore}%
                </div>
                <div style="display: flex; justify-content: space-around; margin-top: 24px;">
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: #28a745; margin-bottom: 8px;">${data.environment}%</div>
                        <div style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">Environment</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: #007bff; margin-bottom: 8px;">${data.social}%</div>
                        <div style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">Social</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: #ffc107; margin-bottom: 8px;">${data.governance}%</div>
                        <div style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">Governance</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createCarbonChart() {
        const container = document.getElementById('carbonChart');
        if (!container) return;
        
        // Generate mock trend data matching the image
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const values = [45, 42, 38, 35, 32, 28];
        const maxValue = Math.max(...values);
        
        container.innerHTML = `
            <div style="position: relative; height: 100%; padding: 20px;">
                <div style="position: absolute; top: 20px; right: 20px; font-size: 14px; color: var(--text-secondary); font-weight: 500;">
                    Trend: -12% monthly
                </div>
                <div style="display: flex; align-items: end; height: 200px; gap: 12px; padding: 40px 20px 20px 20px;">
                    ${values.map((value, index) => `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1; gap: 8px;">
                            <div style="background: linear-gradient(to top, #007bff, #28a745); 
                                        height: ${(value / maxValue) * 160}px; width: 100%; border-radius: 6px 6px 0 0; 
                                        margin-bottom: 8px; transition: height 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"></div>
                            <div style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">${months[index]}</div>
                            <div style="font-size: 12px; color: var(--text-primary); font-weight: 600;">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    createCarbonLineChart() {
        const container = document.getElementById('carbonChart');
        if (!container) return;
        
        // Generate mock trend data for line chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const values = [45, 42, 38, 35, 32, 28];
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;
        
        container.innerHTML = `
            <div style="position: relative; height: 100%; padding: 20px;">
                <div style="position: absolute; top: 20px; right: 20px; font-size: 14px; color: var(--text-secondary); font-weight: 500;">
                    Trend: -12% monthly
                </div>
                <div style="position: relative; height: 200px; padding: 40px 20px 20px 20px;">
                    <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#007bff;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#28a745;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <polyline
                            fill="none"
                            stroke="url(#lineGradient)"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            points="${values.map((value, index) => {
                                const x = (index / (values.length - 1)) * 100;
                                const y = 100 - ((value - minValue) / range) * 80;
                                return `${x},${y}`;
                            }).join(' ')}"
                        />
                        ${values.map((value, index) => {
                            const x = (index / (values.length - 1)) * 100;
                            const y = 100 - ((value - minValue) / range) * 80;
                            return `<circle cx="${x}" cy="${y}" r="4" fill="#007bff" stroke="white" stroke-width="2"/>`;
                        }).join('')}
                    </svg>
                    <div style="display: flex; justify-content: space-between; position: absolute; bottom: 0; left: 20px; right: 20px;">
                        ${months.map(month => `<div style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">${month}</div>`).join('')}
                    </div>
                    <div style="display: flex; justify-content: space-between; position: absolute; bottom: 20px; left: 20px; right: 20px;">
                        ${values.map(value => `<div style="font-size: 12px; color: var(--text-primary); font-weight: 600;">${value}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    createSDGChart() {
        const container = document.getElementById('sdgChart');
        if (!container) return;
        
        const sdgData = [
            { goal: 'SDG 7', impact: 85, color: '#ffc107', title: 'Affordable and Clean Energy' },
            { goal: 'SDG 12', impact: 72, color: '#28a745', title: 'Responsible Consumption' },
            { goal: 'SDG 13', impact: 68, color: '#dc3545', title: 'Climate Action' },
            { goal: 'SDG 15', impact: 55, color: '#17a2b8', title: 'Life on Land' },
            { goal: 'SDG 3', impact: 45, color: '#6f42c1', title: 'Good Health' }
        ];
        
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
                ${sdgData.map(item => `
                    <div style="display: flex; align-items: center; gap: 16px; padding: 12px; background: linear-gradient(135deg, var(--bg-card), rgba(255, 255, 255, 0.05)); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="width: 80px; font-size: 12px; color: var(--text-primary); font-weight: 700;">
                            ${item.goal}
                        </div>
                        <div style="flex: 1; background-color: var(--bg-tertiary); height: 12px; border-radius: 6px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);">
                            <div style="background: linear-gradient(90deg, ${item.color}, ${item.color}dd); height: 100%; width: ${item.impact}%; transition: width 0.3s ease; border-radius: 6px;"></div>
                        </div>
                        <div style="width: 50px; font-size: 12px; color: var(--text-primary); font-weight: 700; text-align: right;">
                            ${item.impact}%
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    createProjectsChart() {
        const container = document.getElementById('projectsChart');
        if (!container) return;
        
        const projectData = {
            completed: 8,
            active: 5,
            planning: 3
        };
        
        const total = projectData.completed + projectData.active + projectData.planning;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 24px;">
                <div style="display: flex; justify-content: center; margin-bottom: 32px;">
                    <div style="width: 140px; height: 140px; border-radius: 50%; 
                                background: conic-gradient(
                                    var(--accent-green) 0deg ${(projectData.completed / total) * 360}deg,
                                    var(--accent-blue) ${(projectData.completed / total) * 360}deg ${((projectData.completed + projectData.active) / total) * 360}deg,
                                    var(--accent-red) ${((projectData.completed + projectData.active) / total) * 360}deg 360deg
                                );
                                display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);">
                        <div style="width: 90px; height: 90px; background: linear-gradient(135deg, var(--bg-card), rgba(255, 255, 255, 0.1)); border-radius: 50%; 
                                    display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);">
                            <div style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, var(--accent-green), var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${total}</div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-around; gap: 16px;">
                    <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, var(--bg-card), rgba(255, 255, 255, 0.05)); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="width: 16px; height: 16px; background-color: var(--accent-green); border-radius: 3px; margin: 0 auto 8px;"></div>
                        <div style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">Completed</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${projectData.completed}</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, var(--bg-card), rgba(255, 255, 255, 0.05)); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="width: 16px; height: 16px; background-color: var(--accent-blue); border-radius: 3px; margin: 0 auto 8px;"></div>
                        <div style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">Active</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${projectData.active}</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, var(--bg-card), rgba(255, 255, 255, 0.05)); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="width: 16px; height: 16px; background-color: var(--accent-red); border-radius: 3px; margin: 0 auto 8px;"></div>
                        <div style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">Planning</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${projectData.planning}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateMockProjects() {
        // Projects are already in HTML, just add event listeners
        console.log('Mock projects loaded');
    }
    
    generateMockReports() {
        // Reports are already in HTML, just add event listeners
        console.log('Mock reports loaded');
    }
    
    updateOverviewMetrics() {
        // Update sustainability score
        const sustainabilityScore = document.getElementById('sustainabilityScore');
        const sustainabilityTrend = document.getElementById('sustainabilityTrend');
        if (sustainabilityScore) {
            sustainabilityScore.textContent = '81%';
        }
        if (sustainabilityTrend) {
            sustainabilityTrend.innerHTML = '<span class="material-icons">trending_up</span><span>+5% from last month</span>';
        }
        
        // Update carbon footprint
        const carbonFootprint = document.getElementById('carbonFootprint');
        const carbonTrend = document.getElementById('carbonTrend');
        if (carbonFootprint) {
            carbonFootprint.textContent = '28.0 tCO₂e';
        }
        if (carbonTrend) {
            carbonTrend.innerHTML = '<span class="material-icons">trending_down</span><span>-12% from last month</span>';
        }
        
        // Update SDG goals
        const sdgGoals = document.getElementById('sdgGoals');
        const sdgTrend = document.getElementById('sdgTrend');
        if (sdgGoals) {
            sdgGoals.textContent = '5';
        }
        if (sdgTrend) {
            sdgTrend.innerHTML = '<span class="material-icons">add</span><span>3 new goals this month</span>';
        }
        
        // Update active projects
        const activeProjects = document.getElementById('activeProjects');
        const projectsTrend = document.getElementById('projectsTrend');
        if (activeProjects) {
            activeProjects.textContent = '5';
        }
        if (projectsTrend) {
            projectsTrend.innerHTML = '<span class="material-icons">play_arrow</span><span>2 completed this week</span>';
        }
    }
    
    refreshData() {
        // Simulate data refresh
        const refreshBtn = document.getElementById('refreshData');
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<span class="material-icons">refresh</span> Refreshing...';
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            this.generateMockData();
            this.updateOverviewMetrics();
            this.initializeCharts();
            
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            this.showNotification('Data refreshed successfully', 'success');
        }, 2000);
    }
    
    exportAllData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            overview: this.data,
            projects: this.getProjectData(),
            reports: this.getReportData()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sustainability-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully', 'success');
    }
    
    updateTimePeriod(period) {
        console.log('Time period updated:', period);
        // In a real application, this would fetch new data based on the time period
        this.showNotification(`Data updated for ${period}`, 'info');
    }
    
    toggleChartType(button) {
        const chartContainer = button.closest('.chart-container');
        const chartButtons = chartContainer.querySelectorAll('.chart-btn');
        
        chartButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const chartType = button.getAttribute('data-chart');
        console.log('Chart type changed to:', chartType);
        
        // Re-render chart with new type
        if (chartContainer.querySelector('#carbonChart')) {
            this.createCarbonChart();
        }
    }
    
    addNewProject() {
        this.showNotification('Add Project feature coming soon', 'info');
    }
    
    generateReport() {
        this.showNotification('Generating comprehensive report...', 'info');
        
        setTimeout(() => {
            this.showNotification('Report generated successfully', 'success');
        }, 3000);
    }
    
    scheduleReport() {
        this.showNotification('Report scheduling feature coming soon', 'info');
    }
    
    backupData() {
        this.showNotification('Creating data backup...', 'info');
        
        setTimeout(() => {
            this.showNotification('Backup completed successfully', 'success');
        }, 2000);
    }
    
    importData() {
        this.showNotification('Data import feature coming soon', 'info');
    }
    
    syncData() {
        this.showNotification('Syncing data with cloud...', 'info');
        
        setTimeout(() => {
            this.showNotification('Data synced successfully', 'success');
        }, 1500);
    }
    
    downloadReport(button) {
        const reportCard = button.closest('.report-card');
        const reportTitle = reportCard.querySelector('h3').textContent;
        
        this.showNotification(`Downloading ${reportTitle}...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`${reportTitle} downloaded successfully`, 'success');
        }, 2000);
    }
    
    viewReport(button) {
        const reportCard = button.closest('.report-card');
        const reportTitle = reportCard.querySelector('h3').textContent;
        
        this.showNotification(`Opening ${reportTitle}...`, 'info');
    }
    
    updateProject(button) {
        const projectCard = button.closest('.project-card');
        const projectTitle = projectCard.querySelector('h3').textContent;
        
        this.showNotification(`Updating ${projectTitle}...`, 'info');
    }
    
    viewProjectDetails(button) {
        const projectCard = button.closest('.project-card');
        const projectTitle = projectCard.querySelector('h3').textContent;
        
        this.showNotification(`Viewing details for ${projectTitle}...`, 'info');
    }
    
    getProjectData() {
        return {
            renewable: { progress: 75, status: 'active' },
            waste: { progress: 100, status: 'completed' },
            training: { progress: 25, status: 'planning' }
        };
    }
    
    getReportData() {
        return {
            sustainability: { size: '2.3 MB', date: 'Jan 31, 2024' },
            carbon: { size: '1.8 MB', date: 'Jan 28, 2024' },
            sdg: { size: '1.5 MB', date: 'Jan 25, 2024' },
            projects: { size: '1.2 MB', date: 'Jan 20, 2024' }
        };
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
}

// Initialize Data Center Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DataCenterManager();
});
