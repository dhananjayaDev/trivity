// Dashboard JavaScript functionality - Pure JavaScript (no frameworks)

class Dashboard {
    constructor() {
        this.init();
    }
    
    async init() {
        await this.loadDashboardData();
        this.createMiniCharts();
        this.createSessionsChart();
        this.createPageViewsChart();
        this.setupEventListeners();
    }
    
    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard-data');
            const data = await response.json();
            this.updateMetrics(data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    updateMetrics(data) {
        // Update metric values
        this.updateElement('users-count', data.users.count);
        this.updateElement('users-change', data.users.change);
        this.updateElement('conversions-count', data.conversions.count);
        this.updateElement('conversions-change', data.conversions.change);
        this.updateElement('events-count', data.event_count.count);
        this.updateElement('events-change', data.event_count.change);
        this.updateElement('sessions-count', data.sessions.count);
        this.updateElement('sessions-change', data.sessions.change);
        this.updateElement('pageviews-count', data.page_views_downloads.count);
        this.updateElement('pageviews-change', data.page_views_downloads.change);
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    createMiniCharts() {
        // Create mini line charts for metric cards
        const charts = ['users-chart', 'conversions-chart', 'events-chart'];
        charts.forEach(chartId => {
            this.createMiniLineChart(chartId);
        });
    }
    
    createMiniLineChart(chartId) {
        const container = document.getElementById(chartId);
        if (!container) return;
        
        container.innerHTML = ''; // Clear existing content
        
        // Different data patterns for different charts
        let data, color, gradientColor;
        
        if (chartId === 'users-chart') {
            // Green upward trend with realistic drops and sudden ups
            data = [12, 18, 15, 25, 20, 35, 28, 45, 38, 50, 42, 60, 55, 70, 62, 80, 75, 85, 78, 90, 85, 95, 88, 100, 92, 105, 98, 110, 102, 115, 108, 120, 112, 125, 118, 130, 122, 135, 128, 140];
            color = '#4caf50';
            gradientColor = '#4caf50';
        } else if (chartId === 'conversions-chart') {
            // Red downward trend with realistic drops and sudden ups
            data = [140, 135, 130, 125, 120, 115, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 12, 6, 9, 4, 7, 2, 5, 1, 3, 0, 2, 0];
            color = '#f44336';
            gradientColor = '#f44336';
        } else if (chartId === 'events-chart') {
            // Grey flat trend with realistic drops and sudden ups
            data = [30, 35, 28, 40, 32, 45, 38, 50, 42, 55, 48, 60, 52, 65, 58, 70, 62, 75, 68, 80, 72, 85, 78, 90, 82, 95, 88, 100, 92, 105, 98, 110, 102, 115, 108, 120, 112, 125, 118, 130];
            color = '#b0b0b0';
            gradientColor = '#b0b0b0';
        }
        
        const width = container.offsetWidth || 200;
        const height = container.offsetHeight || 40;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Create gradient
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', `gradient-${chartId}`);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', gradientColor);
        stop1.setAttribute('stop-opacity', '0.3');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', gradientColor);
        stop2.setAttribute('stop-opacity', '0');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        
        // Create area fill
        const areaData = this.createAreaPath(data, width, height);
        const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        area.setAttribute('d', areaData);
        area.setAttribute('fill', `url(#gradient-${chartId})`);
        
        // Create path for line
        const pathData = this.createLinePath(data, width, height);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        svg.appendChild(defs);
        svg.appendChild(area);
        svg.appendChild(path);
        container.appendChild(svg);
    }
    
    createLinePath(data, width, height) {
        const stepX = width / (data.length - 1);
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;
        
        let path = `M 0 ${height - ((data[0] - minValue) / range) * height}`;
        
        for (let i = 1; i < data.length; i++) {
            const x = i * stepX;
            const y = height - ((data[i] - minValue) / range) * height;
            path += ` L ${x} ${y}`;
        }
        
        return path;
    }
    
    createAreaPath(data, width, height) {
        const stepX = width / (data.length - 1);
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;
        
        let path = `M 0 ${height}`;
        path += ` L 0 ${height - ((data[0] - minValue) / range) * height}`;
        
        for (let i = 1; i < data.length; i++) {
            const x = i * stepX;
            const y = height - ((data[i] - minValue) / range) * height;
            path += ` L ${x} ${y}`;
        }
        
        path += ` L ${width} ${height} Z`;
        return path;
    }
    
    createSessionsChart() {
        const canvas = document.getElementById('sessionsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Generate data matching the image - 30 days with specific trend
        const labels = ['Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'Apr 30'];
        
        // Stacked area chart data - three layers matching the first image exactly
        // Total values: ~2,000-3,000 on Apr 5 to ~22,000-23,000 on Apr 30
        const bottomLayer = [2000, 3000, 4000, 5000, 6000, 7000]; // Dark blue base
        const middleLayer = [3000, 4000, 5000, 6000, 7000, 8000]; // Light blue/teal
        const topLayer = [2000, 3000, 4000, 5000, 6000, 7000]; // White/light gray
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bottom Layer',
                    data: bottomLayer,
                    borderColor: '#0d47a1',
                    backgroundColor: '#0d47a1',
                    fill: '+1',
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    borderWidth: 0
                }, {
                    label: 'Middle Layer',
                    data: middleLayer,
                    borderColor: '#42a5f5',
                    backgroundColor: '#42a5f5',
                    fill: '+1',
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    borderWidth: 0
                }, {
                    label: 'Top Layer',
                    data: topLayer,
                    borderColor: '#e3f2fd',
                    backgroundColor: '#e3f2fd',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    borderWidth: 0
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
                    x: {
                        ticks: {
                            color: '#b0b0b0',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: '#333333',
                            drawBorder: false,
                            lineWidth: 1
                        }
                    },
                    y: {
                        min: 0,
                        max: 25000,
                        ticks: {
                            color: '#b0b0b0',
                            font: {
                                size: 10
                            },
                            stepSize: 5000,
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        grid: {
                            color: '#333333',
                            drawBorder: false,
                            lineWidth: 1,
                            borderDash: [5, 5]
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 0
                    }
                },
                interaction: {
                    intersect: false
                }
            }
        });
    }
    
    createPageViewsChart() {
        const canvas = document.getElementById('pageviewsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Data matching the image - 6 months with specific values
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        
        // Stacked bar chart data - three layers with different blue shades
        // Peak in May (~12,000), decline in June and July
        const bottomLayer = [3000, 3500, 2500, 4000, 4500, 2500, 2000]; // Dark blue
        const middleLayer = [2000, 2500, 2000, 2500, 3000, 2000, 1500]; // Medium blue
        const topLayer = [2000, 2500, 1500, 3000, 4000, 1500, 1000]; // Light blue
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Bottom Layer',
                    data: bottomLayer,
                    backgroundColor: '#0d47a1',
                    borderWidth: 0
                }, {
                    label: 'Middle Layer',
                    data: middleLayer,
                    backgroundColor: '#1976d2',
                    borderWidth: 0
                }, {
                    label: 'Top Layer',
                    data: topLayer,
                    backgroundColor: '#42a5f5',
                    borderWidth: 0
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
                    x: {
                        stacked: true,
                        ticks: {
                            color: '#b0b0b0',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: '#333333',
                            drawBorder: false,
                            lineWidth: 1
                        }
                    },
                    y: {
                        stacked: true,
                        min: 0,
                        max: 15000,
                        ticks: {
                            color: '#b0b0b0',
                            font: {
                                size: 10
                            },
                            stepSize: 5000,
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        grid: {
                            color: '#333333',
                            drawBorder: false,
                            lineWidth: 1,
                            borderDash: [5, 5]
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 6
                    }
                }
            }
        });
    }
    
    setupEventListeners() {
        // Navigation button clicks
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                navButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                e.target.closest('.nav-button').classList.add('active');
            });
        });
        
        // Promo button click
        const promoButton = document.querySelector('.promo-button');
        if (promoButton) {
            promoButton.addEventListener('click', () => {
                alert('Redirecting to discount page...');
            });
        }
        
        // Explore button click
        const exploreButton = document.querySelector('.explore-button');
        if (exploreButton) {
            exploreButton.addEventListener('click', () => {
                alert('Opening data insights...');
            });
        }
        
        // Search functionality
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value;
                    if (query.trim()) {
                        alert(`Searching for: ${query}`);
                    }
                }
            });
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
