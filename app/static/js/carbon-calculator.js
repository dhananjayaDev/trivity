/**
 * Carbon Emissions Calculator
 * Handles real-time carbon footprint calculations with industry-standard emission factors
 */

class CarbonCalculator {
    constructor() {
        this.emissionFactors = {
            // Electricity emission factors (kg CO₂e/kWh)
            electricity: {
                default: 0.5, // Global average
                renewable: 0.0 // Renewable energy has zero emissions
            },
            
            // Vehicle emission factors (kg CO₂e/km)
            vehicles: {
                sedan: 0.192,
                suv: 0.251,
                truck: 0.314,
                hybrid: 0.120,
                electric: 0.053, // Based on grid mix
                diesel: 0.171
            },
            
            // Flight emission factors (kg CO₂e/km per passenger)
            flights: {
                economy: 0.255,
                business: 0.382,
                first: 0.510
            },
            
            // Public transport emission factors (kg CO₂e/km per passenger)
            publicTransport: {
                bus: 0.089,
                train: 0.041,
                metro: 0.027,
                tram: 0.022
            },
            
            // Refrigerant GWP (Global Warming Potential)
            refrigerants: {
                r22: 1810,    // HCFC-22
                r134a: 1430,  // HFC-134a
                r410a: 2088, // HFC-410A
                r404a: 3922, // HFC-404A
                r507: 3985   // HFC-507
            },
            
            // Mobile data emission factors (kg CO₂e/GB)
            mobileData: {
                smartphone: 0.0001,
                tablet: 0.0002,
                laptop: 0.0003,
                desktop: 0.0005
            },
            
            // Fuel combustion emission factors (kg CO₂e per unit)
            fuels: {
                'natural-gas': 2.0,     // kg CO₂e/m³
                propane: 1.5,           // kg CO₂e/L
                'heating-oil': 2.7,     // kg CO₂e/L
                coal: 2.4,             // kg CO₂e/kg
                wood: 1.8              // kg CO₂e/kg
            }
        };
        
        this.calculations = {
            electricity: 0,
            transportation: 0,
            refrigerants: 0,
            mobile: 0,
            combustion: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupTransportationTabs();
        this.updateAllCalculations();
        this.generateRecommendations();
    }
    
    setupEventListeners() {
        // Electricity inputs
        document.getElementById('electricityUsage')?.addEventListener('input', () => this.calculateElectricity());
        document.getElementById('electricityUnit')?.addEventListener('change', () => this.calculateElectricity());
        document.getElementById('gridEmissionFactor')?.addEventListener('input', () => this.calculateElectricity());
        document.getElementById('renewablePercentage')?.addEventListener('input', () => this.calculateElectricity());
        
        // Transportation inputs
        document.getElementById('vehicleType')?.addEventListener('change', () => this.calculateTransportation());
        document.getElementById('vehicleDistance')?.addEventListener('input', () => this.calculateTransportation());
        document.getElementById('distanceUnit')?.addEventListener('change', () => this.calculateTransportation());
        document.getElementById('fuelEfficiency')?.addEventListener('input', () => this.calculateTransportation());
        
        document.getElementById('flightDistance')?.addEventListener('input', () => this.calculateTransportation());
        document.getElementById('flightClass')?.addEventListener('change', () => this.calculateTransportation());
        document.getElementById('flightPassengers')?.addEventListener('input', () => this.calculateTransportation());
        
        document.getElementById('publicTransportType')?.addEventListener('change', () => this.calculateTransportation());
        document.getElementById('publicDistance')?.addEventListener('input', () => this.calculateTransportation());
        document.getElementById('publicTrips')?.addEventListener('input', () => this.calculateTransportation());
        
        // Refrigerant inputs
        document.getElementById('refrigerantType')?.addEventListener('change', () => this.calculateRefrigerants());
        document.getElementById('refrigerantAmount')?.addEventListener('input', () => this.calculateRefrigerants());
        document.getElementById('leakRate')?.addEventListener('input', () => this.calculateRefrigerants());
        
        // Mobile inputs
        document.getElementById('dataUsage')?.addEventListener('input', () => this.calculateMobile());
        document.getElementById('dataUnit')?.addEventListener('change', () => this.calculateMobile());
        document.getElementById('deviceCount')?.addEventListener('input', () => this.calculateMobile());
        document.getElementById('deviceType')?.addEventListener('change', () => this.calculateMobile());
        
        // Combustion inputs
        document.getElementById('fuelType')?.addEventListener('change', () => this.calculateCombustion());
        document.getElementById('fuelConsumption')?.addEventListener('input', () => this.calculateCombustion());
        document.getElementById('fuelUnit')?.addEventListener('change', () => this.calculateCombustion());
        document.getElementById('usagePeriod')?.addEventListener('change', () => this.calculateCombustion());
        
        // Action buttons
        document.getElementById('resetCalculator')?.addEventListener('click', () => this.resetCalculator());
        document.getElementById('saveData')?.addEventListener('click', () => this.getAIRecommendations());
        document.getElementById('exportReport')?.addEventListener('click', () => this.exportReport());
    }
    
    setupTransportationTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }
    
    calculateElectricity() {
        const usage = parseFloat(document.getElementById('electricityUsage')?.value || 0);
        const unit = document.getElementById('electricityUnit')?.value || 'kwh';
        const emissionFactor = parseFloat(document.getElementById('gridEmissionFactor')?.value || 0.5);
        const renewablePercentage = parseFloat(document.getElementById('renewablePercentage')?.value || 0);
        
        // Convert to kWh if needed
        let usageKWh = usage;
        if (unit === 'mwh') {
            usageKWh = usage * 1000;
        }
        
        // Calculate base emissions
        const baseEmissions = usageKWh * emissionFactor;
        
        // Calculate renewable offset
        const renewableOffset = baseEmissions * (renewablePercentage / 100);
        
        // Calculate net emissions
        const netEmissions = baseEmissions - renewableOffset;
        
        // Convert to tonnes CO₂e
        this.calculations.electricity = netEmissions / 1000;
        
        // Update display
        this.updateElectricityDisplay(baseEmissions / 1000, renewableOffset / 1000);
        this.updateAllCalculations();
    }
    
    updateElectricityDisplay(baseEmissions, renewableOffset) {
        document.getElementById('electricityEmissions').textContent = `${this.calculations.electricity.toFixed(2)} tCO₂e`;
        document.getElementById('electricityBaseEmissions').textContent = `${baseEmissions.toFixed(2)} tCO₂e`;
        document.getElementById('electricityRenewableOffset').textContent = `${renewableOffset.toFixed(2)} tCO₂e`;
    }
    
    calculateTransportation() {
        let totalEmissions = 0;
        
        // Vehicle emissions
        const vehicleType = document.getElementById('vehicleType')?.value;
        const vehicleDistance = parseFloat(document.getElementById('vehicleDistance')?.value || 0);
        const distanceUnit = document.getElementById('distanceUnit')?.value || 'km';
        const fuelEfficiency = parseFloat(document.getElementById('fuelEfficiency')?.value || 8.5);
        
        if (vehicleType && vehicleDistance > 0) {
            let distanceKm = vehicleDistance;
            if (distanceUnit === 'miles') {
                distanceKm = vehicleDistance * 1.60934;
            }
            
            const emissionFactor = this.emissionFactors.vehicles[vehicleType] || 0.192;
            const vehicleEmissions = distanceKm * emissionFactor;
            totalEmissions += vehicleEmissions;
        }
        
        // Flight emissions
        const flightDistance = parseFloat(document.getElementById('flightDistance')?.value || 0);
        const flightClass = document.getElementById('flightClass')?.value || 'economy';
        const flightPassengers = parseInt(document.getElementById('flightPassengers')?.value || 1);
        
        if (flightDistance > 0) {
            const emissionFactor = this.emissionFactors.flights[flightClass];
            const flightEmissions = flightDistance * emissionFactor * flightPassengers;
            totalEmissions += flightEmissions;
        }
        
        // Public transport emissions
        const publicTransportType = document.getElementById('publicTransportType')?.value;
        const publicDistance = parseFloat(document.getElementById('publicDistance')?.value || 0);
        const publicTrips = parseInt(document.getElementById('publicTrips')?.value || 0);
        
        if (publicTransportType && publicDistance > 0 && publicTrips > 0) {
            const emissionFactor = this.emissionFactors.publicTransport[publicTransportType];
            const monthlyDistance = publicDistance * publicTrips;
            const publicEmissions = monthlyDistance * emissionFactor;
            totalEmissions += publicEmissions;
        }
        
        // Convert to tonnes CO₂e
        this.calculations.transportation = totalEmissions / 1000;
        
        // Update display
        document.getElementById('transportationEmissions').textContent = `${this.calculations.transportation.toFixed(2)} tCO₂e`;
        this.updateAllCalculations();
    }
    
    calculateRefrigerants() {
        const refrigerantType = document.getElementById('refrigerantType')?.value;
        const refrigerantAmount = parseFloat(document.getElementById('refrigerantAmount')?.value || 0);
        const leakRate = parseFloat(document.getElementById('leakRate')?.value || 5);
        
        if (refrigerantType && refrigerantAmount > 0) {
            const gwp = this.emissionFactors.refrigerants[refrigerantType];
            const leakedAmount = refrigerantAmount * (leakRate / 100);
            const emissions = leakedAmount * gwp;
            
            // Convert to tonnes CO₂e
            this.calculations.refrigerants = emissions / 1000;
        } else {
            this.calculations.refrigerants = 0;
        }
        
        // Update display
        document.getElementById('refrigerantsEmissions').textContent = `${this.calculations.refrigerants.toFixed(2)} tCO₂e`;
        this.updateAllCalculations();
    }
    
    calculateMobile() {
        const dataUsage = parseFloat(document.getElementById('dataUsage')?.value || 0);
        const dataUnit = document.getElementById('dataUnit')?.value || 'gb';
        const deviceCount = parseInt(document.getElementById('deviceCount')?.value || 1);
        const deviceType = document.getElementById('deviceType')?.value || 'smartphone';
        
        if (dataUsage > 0) {
            // Convert to GB if needed
            let usageGB = dataUsage;
            if (dataUnit === 'tb') {
                usageGB = dataUsage * 1024;
            }
            
            const emissionFactor = this.emissionFactors.mobileData[deviceType];
            const emissions = usageGB * emissionFactor * deviceCount;
            
            // Convert to tonnes CO₂e
            this.calculations.mobile = emissions / 1000;
        } else {
            this.calculations.mobile = 0;
        }
        
        // Update display
        document.getElementById('mobileEmissions').textContent = `${this.calculations.mobile.toFixed(2)} tCO₂e`;
        this.updateAllCalculations();
    }
    
    calculateCombustion() {
        const fuelType = document.getElementById('fuelType')?.value;
        const fuelConsumption = parseFloat(document.getElementById('fuelConsumption')?.value || 0);
        const fuelUnit = document.getElementById('fuelUnit')?.value || 'cubic-meters';
        const usagePeriod = document.getElementById('usagePeriod')?.value || 'monthly';
        
        if (fuelType && fuelConsumption > 0) {
            const emissionFactor = this.emissionFactors.fuels[fuelType];
            let emissions = fuelConsumption * emissionFactor;
            
            // Adjust for usage period
            if (usagePeriod === 'quarterly') {
                emissions = emissions * 3;
            } else if (usagePeriod === 'annually') {
                emissions = emissions * 12;
            }
            
            // Convert to tonnes CO₂e
            this.calculations.combustion = emissions / 1000;
        } else {
            this.calculations.combustion = 0;
        }
        
        // Update display
        document.getElementById('combustionEmissions').textContent = `${this.calculations.combustion.toFixed(2)} tCO₂e`;
        this.updateAllCalculations();
    }
    
    updateAllCalculations() {
        const totalEmissions = Object.values(this.calculations).reduce((sum, value) => sum + value, 0);
        const reductionPotential = totalEmissions * 0.3; // Assume 30% reduction potential
        const annualProjection = totalEmissions * 12; // Monthly to annual
        
        // Update overview cards
        document.getElementById('totalEmissions').textContent = totalEmissions.toFixed(2);
        document.getElementById('reductionPotential').textContent = reductionPotential.toFixed(2);
        document.getElementById('annualProjection').textContent = annualProjection.toFixed(2);
        
        // Update chart
        this.updateEmissionChart();
        
        // Get AI recommendations if there are emissions
        if (totalEmissions > 0) {
            this.getAIRecommendations();
        }
    }
    
    updateEmissionChart() {
        const chartContainer = document.getElementById('emissionChart');
        if (!chartContainer) return;
        
        const categories = [
            { name: 'Electricity', value: this.calculations.electricity, color: '#007bff' },
            { name: 'Transportation', value: this.calculations.transportation, color: '#28a745' },
            { name: 'Refrigerants', value: this.calculations.refrigerants, color: '#ffc107' },
            { name: 'Mobile', value: this.calculations.mobile, color: '#17a2b8' },
            { name: 'Combustion', value: this.calculations.combustion, color: '#dc3545' }
        ];
        
        const total = categories.reduce((sum, cat) => sum + cat.value, 0);
        
        if (total === 0) {
            chartContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Enter data to see emission breakdown</div>';
            return;
        }
        
        let chartHTML = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        
        categories.forEach(category => {
            if (category.value > 0) {
                const percentage = (category.value / total) * 100;
                chartHTML += `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 16px; height: 16px; background-color: ${category.color}; border-radius: 3px;"></div>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${category.name}</span>
                                <span style="color: var(--text-primary); font-size: 14px; font-weight: 600;">${category.value.toFixed(2)} tCO₂e</span>
                            </div>
                            <div style="background-color: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background-color: ${category.color}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        chartHTML += '</div>';
        chartContainer.innerHTML = chartHTML;
    }
    
    generateRecommendations() {
        const recommendationsContainer = document.getElementById('reductionRecommendations');
        if (!recommendationsContainer) return;
        
        // Show loading state
        recommendationsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                    <div class="spinner" style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #4caf50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span>Enter data to get AI-powered recommendations...</span>
                </div>
            </div>
        `;
    }
    
    updateAIRecommendations(analysis) {
        const recommendationsContainer = document.getElementById('reductionRecommendations');
        if (!recommendationsContainer || !analysis) return;
        
        let recommendationsHTML = '';
        
        // Add AI analysis summary
        if (analysis.overall_assessment) {
            recommendationsHTML += `
                <div class="ai-analysis-summary" style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
                    <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">AI Analysis</h4>
                    <p style="margin: 0; color: #424242; font-size: 14px; line-height: 1.5;">${analysis.overall_assessment}</p>
                </div>
            `;
        }
        
        // Add key insights
        if (analysis.key_insights && analysis.key_insights.length > 0) {
            recommendationsHTML += `
                <div class="key-insights" style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 16px;">Key Insights</h4>
                    <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
                        ${analysis.key_insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add improvement recommendations
        if (analysis.improvement_recommendations && analysis.improvement_recommendations.length > 0) {
            recommendationsHTML += `
                <div class="improvement-recommendations">
                    <h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 16px;">Improvement Recommendations</h4>
            `;
            
            analysis.improvement_recommendations.forEach((rec, index) => {
                const icons = ['bolt', 'directions_car', 'eco', 'ac_unit', 'cloud_done', 'trending_up'];
                const icon = icons[index % icons.length];
                
                recommendationsHTML += `
                    <div class="recommendation-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                        <div class="recommendation-icon" style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #4caf50, #2196f3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span class="material-icons" style="color: white; font-size: 18px;">${icon}</span>
                        </div>
                        <div class="recommendation-content" style="flex: 1;">
                            <div class="recommendation-title" style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 14px;">Recommendation ${index + 1}</div>
                            <div class="recommendation-description" style="color: var(--text-secondary); font-size: 13px; line-height: 1.5;">${rec}</div>
                        </div>
                    </div>
                `;
            });
            
            recommendationsHTML += `</div>`;
        }
        
        // Add priority actions
        if (analysis.priority_actions && analysis.priority_actions.length > 0) {
            recommendationsHTML += `
                <div class="priority-actions" style="margin-top: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 16px;">Priority Actions</h4>
                    <div style="background: #fff3e0; padding: 12px; border-radius: 8px; border-left: 4px solid #ff9800;">
                        <ul style="margin: 0; padding-left: 20px; color: #e65100; font-size: 14px; line-height: 1.6;">
                            ${analysis.priority_actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // Add estimated reduction potential
        if (analysis.estimated_reduction_potential) {
            recommendationsHTML += `
                <div class="reduction-potential" style="margin-top: 20px; text-align: center; background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%); padding: 16px; border-radius: 8px; border: 1px solid #4caf50;">
                    <h4 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 16px;">Estimated Reduction Potential</h4>
                    <p style="margin: 0; color: #388e3c; font-size: 18px; font-weight: 600;">${analysis.estimated_reduction_potential}</p>
                </div>
            `;
        }
        
        recommendationsContainer.innerHTML = recommendationsHTML;
    }
    
    resetCalculator() {
        // Reset all input fields
        const inputs = document.querySelectorAll('.form-input, .form-select');
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
        });
        
        // Reset calculations
        Object.keys(this.calculations).forEach(key => {
            this.calculations[key] = 0;
        });
        
        // Reset displays
        document.querySelectorAll('.category-emissions').forEach(el => {
            el.textContent = '0.00 tCO₂e';
        });
        
        document.getElementById('totalEmissions').textContent = '0.00';
        document.getElementById('reductionPotential').textContent = '0.00';
        document.getElementById('annualProjection').textContent = '0.00';
        
        // Reset chart
        document.getElementById('emissionChart').innerHTML = '<div style="text-align: center; color: var(--text-muted);">Enter data to see emission breakdown</div>';
        
        // Reset calculation details
        document.getElementById('electricityBaseEmissions').textContent = '0.00 tCO₂e';
        document.getElementById('electricityRenewableOffset').textContent = '0.00 tCO₂e';
    }
    
    async getAIRecommendations() {
        try {
            // Prepare carbon data for AI analysis
            const carbonData = {
                electricity: this.calculations.electricity,
                transportation: this.calculations.transportation,
                refrigerants: this.calculations.refrigerants,
                mobile: this.calculations.mobile,
                combustion: this.calculations.combustion
            };
            
            // Get AI analysis without saving to database
            const response = await fetch('/api/carbon/analyze-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    carbon_data: carbonData,
                    industry: 'Not specified',
                    size: 'Not specified'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update recommendations with AI analysis
                this.updateAIRecommendations(result.analysis);
                this.showNotification('AI recommendations updated!', 'success');
                return result;
            } else {
                throw new Error(result.error || 'Failed to get AI recommendations');
            }
            
        } catch (error) {
            console.error('AI analysis error:', error);
            this.showNotification(`Error getting AI recommendations: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    showNotification(message, type = 'info') {
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
    
    exportReport() {
        // Export report directly without API call
        this.downloadReport();
    }
    
    downloadReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            totalEmissions: Object.values(this.calculations).reduce((sum, value) => sum + value, 0),
            breakdown: this.calculations,
            recommendations: 'Generated recommendations for emission reduction'
        };
        
        const reportText = `Carbon Emissions Report
Generated: ${new Date().toLocaleDateString()}

Total Carbon Footprint: ${reportData.totalEmissions.toFixed(2)} tonnes CO₂e

Breakdown:
- Electricity: ${this.calculations.electricity.toFixed(2)} tCO₂e
- Transportation: ${this.calculations.transportation.toFixed(2)} tCO₂e
- Refrigerants: ${this.calculations.refrigerants.toFixed(2)} tCO₂e
- Mobile: ${this.calculations.mobile.toFixed(2)} tCO₂e
- Combustion: ${this.calculations.combustion.toFixed(2)} tCO₂e

Annual Projection: ${(reportData.totalEmissions * 12).toFixed(2)} tonnes CO₂e/year
Reduction Potential: ${(reportData.totalEmissions * 0.3).toFixed(2)} tonnes CO₂e

Recommendations:
1. Switch to renewable energy sources
2. Optimize transportation methods
3. Improve energy efficiency
4. Maintain refrigerant systems
5. Optimize digital usage

This report was generated using industry-standard emission factors and calculation methods.`;
        
        // Create and download file
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carbon-emissions-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
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

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarbonCalculator();
});
