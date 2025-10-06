class DataCenterManager {
    constructor() {
        this.charts = {};
        this.metricsData = {};
        this.insightsData = {};
        this.timeRange = '30d';
        
        this.init();
    }

    async init() {
        console.log('Initializing Data Center...');
        this.setupEventListeners();
        await this.loadAllData();
        this.initializeCharts();
        this.updateMetricsDisplay();
        this.updateInsightsDisplay();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshAllData')?.addEventListener('click', () => {
            this.refreshAllData();
        });

        // Export button
        document.getElementById('exportData')?.addEventListener('click', () => {
            this.exportAllData();
        });

        // Time range selector
        document.getElementById('timeRange')?.addEventListener('change', (e) => {
            this.timeRange = e.target.value;
            this.loadAllData();
        });

        // View toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.toggle-btn').classList.add('active');
                this.toggleView(e.target.closest('.toggle-btn').dataset.view);
            });
        });

        // Chart controls
        document.getElementById('toggleCharts')?.addEventListener('click', () => {
            this.toggleCharts();
        });

        // Generate insights
        document.getElementById('generateInsights')?.addEventListener('click', () => {
            this.generateNewInsights();
        });
    }

    async loadAllData() {
        try {
            console.log('Loading all data...');
            
            // Load dashboard data (includes SRI scores, carbon data, etc.)
            const dashboardResponse = await fetch('/api/dashboard/data');
            const dashboardResult = await dashboardResponse.json();
            
            if (dashboardResult.success) {
                this.metricsData = dashboardResult.data;
                console.log('Dashboard data loaded:', this.metricsData);
            }

            // Load additional analytics data
            await this.loadAnalyticsData();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please try again.');
        }
    }

    async loadAnalyticsData() {
        try {
            // Load historical data for charts
            const response = await fetch(`/api/analytics/data?timeRange=${this.timeRange}`);
            const result = await response.json();
            
            if (result.success) {
                this.analyticsData = result.data;
                console.log('Analytics data loaded:', this.analyticsData);
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
            // Continue without analytics data
        }
    }

    updateMetricsDisplay() {
        const metricsGrid = document.getElementById('metricsGrid');
        if (!metricsGrid) return;

        const metrics = [
            {
                id: 'sustainability',
                title: 'Sustainability Score',
                value: this.metricsData.scores?.total || 0,
                unit: '%',
                icon: 'assessment',
                trend: this.metricsData.has_sri_assessment ? 'up' : 'neutral',
                trendText: this.metricsData.has_sri_assessment ? 'Based on latest assessment' : 'Complete assessment to see trend'
            },
            {
                id: 'carbon',
                title: 'Carbon Footprint',
                value: this.metricsData.carbon_data?.total_emissions || 0,
                unit: ' tCO₂e',
                icon: 'eco',
                trend: this.metricsData.carbon_data ? 'down' : 'neutral',
                trendText: this.metricsData.carbon_data ? 'Latest calculation' : 'Use calculator to track emissions'
            },
            {
                id: 'sdg',
                title: 'SDG Goals',
                value: this.metricsData.sdg_recommendations?.primary ? 2 : 0,
                unit: '',
                icon: 'flag',
                trend: this.metricsData.sdg_recommendations?.primary ? 'up' : 'neutral',
                trendText: this.metricsData.sdg_recommendations?.primary ? 'AI recommendations available' : 'Complete assessment for recommendations'
            },
            {
                id: 'ai',
                title: 'AI Insights',
                value: this.metricsData.ai_analysis ? Object.keys(this.metricsData.ai_analysis).length : 0,
                unit: '',
                icon: 'psychology',
                trend: this.metricsData.ai_analysis ? 'up' : 'neutral',
                trendText: this.metricsData.ai_analysis ? 'AI analysis complete' : 'AI analysis available after assessment'
            },
            {
                id: 'trophy',
                title: 'Achievement Level',
                value: this.metricsData.trophy_level || 'None',
                unit: '',
                icon: 'emoji_events',
                trend: this.metricsData.trophy_level ? 'up' : 'neutral',
                trendText: this.metricsData.trophy_level ? 'Trophy earned' : 'Complete assessment to earn trophies'
            },
            {
                id: 'lastUpdate',
                title: 'Last Updated',
                value: this.metricsData.last_sri_date ? new Date(this.metricsData.last_sri_date).toLocaleDateString() : 'Never',
                unit: '',
                icon: 'schedule',
                trend: 'neutral',
                trendText: 'Data freshness indicator'
            }
        ];

        metricsGrid.innerHTML = metrics.map(metric => `
            <div class="metric-card" data-metric="${metric.id}">
                <div class="metric-icon">
                    <span class="material-icons">${metric.icon}</span>
                </div>
                <div class="metric-content">
                    <h3>${metric.title}</h3>
                    <div class="metric-value">${metric.value}${metric.unit}</div>
                    <div class="metric-trend trend-${metric.trend}">
                        <span class="material-icons">${this.getTrendIcon(metric.trend)}</span>
                        <span>${metric.trendText}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getTrendIcon(trend) {
        switch (trend) {
            case 'up': return 'trending_up';
            case 'down': return 'trending_down';
            default: return 'trending_flat';
        }
    }

    initializeCharts() {
        this.initializeSustainabilityChart();
        this.initializeCategoryChart();
        this.initializeCarbonChart();
        this.initializeSDGChart();
    }

    initializeSustainabilityChart() {
        const ctx = document.getElementById('sustainabilityChart');
        if (!ctx) return;

        const data = this.analyticsData?.sustainability_trend || this.generateMockTrendData();
        
        this.charts.sustainability = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Sustainability Score',
                    data: data.scores,
                    borderColor: 'var(--accent-red)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Target Score',
                    data: data.targets,
                    borderColor: 'var(--accent-blue)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    initializeCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const scores = this.metricsData.scores || {};
        const data = {
            labels: ['Environmental', 'Social', 'Economic', 'Governance', 'Innovation', 'Stakeholder'],
            datasets: [{
                data: [
                    scores.environmental_management || 0,
                    scores.social_responsibility || 0,
                    scores.economic_sustainability || 0,
                    scores.governance_compliance || 0,
                    scores.innovation_technology || 0,
                    scores.stakeholder_engagement || 0
                ],
                backgroundColor: [
                    'var(--accent-green)',
                    'var(--accent-blue)',
                    'var(--accent-red)',
                    'var(--accent-purple)',
                    'var(--accent-orange)',
                    'var(--accent-teal)'
                ],
                borderWidth: 0
            }]
        };

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    initializeCarbonChart() {
        const ctx = document.getElementById('carbonChart');
        if (!ctx) return;

        const carbonData = this.metricsData.carbon_data || {};
        const data = {
            labels: ['Electricity', 'Transportation', 'Refrigerants', 'Mobile/Digital', 'Combustion'],
            datasets: [{
                data: [
                    carbonData.electricity || 0,
                    carbonData.transportation || 0,
                    carbonData.refrigerants || 0,
                    carbonData.mobile || 0,
                    carbonData.combustion || 0
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800',
                    '#9C27B0',
                    '#F44336'
                ],
                borderWidth: 0
            }]
        };

        this.charts.carbon = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    initializeSDGChart() {
        const ctx = document.getElementById('sdgChart');
        if (!ctx) return;

        const sdgData = this.metricsData.sdg_recommendations || {};
        const data = {
            labels: ['Primary Goals', 'Secondary Goals', 'Other Goals'],
            datasets: [{
                data: [
                    sdgData.primary ? 1 : 0,
                    sdgData.secondary ? 1 : 0,
                    15 - (sdgData.primary ? 1 : 0) - (sdgData.secondary ? 1 : 0)
                ],
                backgroundColor: [
                    '#E91E63',
                    '#9C27B0',
                    'rgba(0, 0, 0, 0.1)'
                ],
                borderWidth: 0
            }]
        };

        this.charts.sdg = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    generateMockTrendData() {
        const days = 30;
        const labels = [];
        const scores = [];
        const targets = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Generate realistic trend data
            const baseScore = this.metricsData.scores?.total || 45;
            const variation = Math.sin(i * 0.2) * 5 + Math.random() * 3;
            scores.push(Math.max(0, Math.min(100, baseScore + variation)));
            targets.push(75); // Target score
        }

        return { labels, scores, targets };
    }

    updateInsightsDisplay() {
        const container = document.getElementById('insightsContainer');
        if (!container) return;

        const insights = this.metricsData.ai_analysis || {};
        
        if (Object.keys(insights).length === 0) {
            container.innerHTML = `
                <div class="no-insights">
                    <span class="material-icons">psychology</span>
                    <h3>No AI Insights Available</h3>
                    <p>Complete your sustainability assessment to generate AI-powered insights and recommendations.</p>
                    <button class="btn-primary" onclick="window.location.href='/sustainability-index'">
                        <span class="material-icons">assessment</span>
                        Take Assessment
                    </button>
                </div>
            `;
            return;
        }

        const insightCards = [];

        if (insights.overall_assessment) {
            insightCards.push(this.createInsightCard('assessment', 'Overall Assessment', insights.overall_assessment));
        }

        if (insights.key_insights && Array.isArray(insights.key_insights)) {
            insights.key_insights.forEach((insight, index) => {
                insightCards.push(this.createInsightCard('lightbulb', `Key Insight ${index + 1}`, insight));
            });
        }

        if (insights.recommendations && Array.isArray(insights.recommendations)) {
            insights.recommendations.forEach((rec, index) => {
                insightCards.push(this.createInsightCard('recommendation', `Recommendation ${index + 1}`, rec));
            });
        }

        if (insights.priority_areas && Array.isArray(insights.priority_areas)) {
            const priorityText = insights.priority_areas.join(', ');
            insightCards.push(this.createInsightCard('priority', 'Priority Areas', priorityText));
        }

        container.innerHTML = insightCards.join('');
    }

    createInsightCard(type, title, content) {
        const icons = {
            assessment: 'assessment',
            lightbulb: 'lightbulb',
            recommendation: 'recommendation',
            priority: 'flag'
        };

        return `
            <div class="insight-card insight-${type}">
                <div class="insight-icon">
                    <span class="material-icons">${icons[type] || 'info'}</span>
                </div>
                <div class="insight-content">
                    <h3>${title}</h3>
                    <p>${content}</p>
                </div>
            </div>
        `;
    }

    toggleView(view) {
        const grid = document.getElementById('metricsGrid');
        if (!grid) return;

        if (view === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
    }

    toggleCharts() {
        const container = document.getElementById('chartsContainer');
        if (!container) return;

        container.classList.toggle('hidden');
    }

    async generateNewInsights() {
        const button = document.getElementById('generateInsights');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="material-icons">hourglass_empty</span> Generating...';
        }

        try {
            const response = await fetch('/api/ai/generate-insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_data: this.metricsData,
                    time_range: this.timeRange
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.insightsData = result.data;
                this.updateInsightsDisplay();
                this.showSuccess('New insights generated successfully!');
            } else {
                this.showError('Failed to generate insights. Please try again.');
            }
        } catch (error) {
            console.error('Error generating insights:', error);
            this.showError('Failed to generate insights. Please try again.');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<span class="material-icons">psychology</span> Generate New Insights';
            }
        }
    }

    async refreshAllData() {
        const button = document.getElementById('refreshAllData');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="material-icons">hourglass_empty</span> Refreshing...';
        }

        try {
            await this.loadAllData();
            this.updateMetricsDisplay();
            this.updateInsightsDisplay();
            this.updateCharts();
            this.showSuccess('Data refreshed successfully!');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showError('Failed to refresh data. Please try again.');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<span class="material-icons">refresh</span> Refresh All Data';
            }
        }
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
    }

    async exportAllData() {
        try {
            const response = await fetch('/api/export/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    format: 'excel',
                    include_charts: true,
                    time_range: this.timeRange
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sustainability-data-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.showSuccess('Data exported successfully!');
            } else {
                this.showError('Failed to export data. Please try again.');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Failed to export data. Please try again.');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="material-icons">${type === 'success' ? 'check_circle' : 'error'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function exportData(format) {
    if (window.dataCenterManager) {
        window.dataCenterManager.exportAllData();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dataCenterManager = new DataCenterManager();
});
