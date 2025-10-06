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
        document.getElementById('saveData')?.addEventListener('click', () => this.submitToAPI());
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
        
        const recommendations = [
            {
                icon: 'bolt',
                title: 'Switch to Renewable Energy',
                description: 'Install solar panels or purchase renewable energy credits to reduce electricity emissions.',
                impact: 'Up to 100% reduction in electricity emissions'
            },
            {
                icon: 'directions_car',
                title: 'Optimize Transportation',
                description: 'Use public transport, carpool, or switch to electric vehicles for daily commuting.',
                impact: 'Up to 80% reduction in transportation emissions'
            },
            {
                icon: 'eco',
                title: 'Improve Energy Efficiency',
                description: 'Upgrade to energy-efficient appliances and implement smart energy management.',
                impact: 'Up to 30% reduction in overall emissions'
            },
            {
                icon: 'ac_unit',
                title: 'Maintain Refrigerant Systems',
                description: 'Regular maintenance and leak detection can significantly reduce refrigerant emissions.',
                impact: 'Up to 50% reduction in refrigerant emissions'
            },
            {
                icon: 'cloud_done',
                title: 'Optimize Digital Usage',
                description: 'Reduce data usage, use cloud services efficiently, and extend device lifespans.',
                impact: 'Up to 20% reduction in digital emissions'
            }
        ];
        
        let recommendationsHTML = '';
        recommendations.forEach(rec => {
            recommendationsHTML += `
                <div class="recommendation-item">
                    <div class="recommendation-icon">
                        <span class="material-icons">${rec.icon}</span>
                    </div>
                    <div class="recommendation-content">
                        <div class="recommendation-title">${rec.title}</div>
                        <div class="recommendation-description">${rec.description}</div>
                    </div>
                    <div class="recommendation-impact">${rec.impact}</div>
                </div>
            `;
        });
        
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
    
    async submitToAPI() {
        try {
            // Prepare carbon data for API
            const carbonData = {
                electricity: this.calculations.electricity,
                transportation: this.calculations.transportation,
                refrigerants: this.calculations.refrigerants,
                mobile: this.calculations.mobile,
                combustion: this.calculations.combustion
            };
            
            // Submit to API for AI analysis and storage
            const response = await fetch('/api/carbon/analyze', {
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
                // Show success message
                this.showNotification('Carbon data saved successfully!', 'success');
                
                // Update dashboard if available
                if (window.dashboardManager) {
                    window.dashboardManager.loadUserData();
                }
                
                return result;
            } else {
                throw new Error(result.error || 'Failed to save carbon data');
            }
            
        } catch (error) {
            console.error('API submission error:', error);
            this.showNotification(`Error saving data: ${error.message}`, 'error');
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
    
    async exportReport() {
        // First save to API, then export
        const apiResult = await this.submitToAPI();
        
        if (apiResult.success) {
            this.downloadReport();
        } else {
            // Still allow download even if API fails
            this.downloadReport();
        }
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
