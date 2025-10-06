// UN SDGs Recommendation System
class SDGRecommendationManager {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.sdgDatabase = this.initializeSDGDatabase();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateStepDisplay();
    }
    
    setupEventListeners() {
        // Step navigation buttons
        document.getElementById('nextToStep2')?.addEventListener('click', () => this.nextStep());
        document.getElementById('backToStep1')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextToStep3')?.addEventListener('click', () => this.nextStep());
        document.getElementById('backToStep2')?.addEventListener('click', () => this.previousStep());
        document.getElementById('downloadReport')?.addEventListener('click', () => this.downloadReport());
    }
    
    nextStep() {
        if (this.validateCurrentStep()) {
            this.collectFormData();
            this.currentStep++;
            this.updateStepDisplay();
            
            if (this.currentStep === 3) {
                this.startAnalysis();
            } else if (this.currentStep === 4) {
                this.generateRecommendations();
            }
        }
    }
    
    previousStep() {
        this.currentStep--;
        this.updateStepDisplay();
    }
    
    validateCurrentStep() {
        if (this.currentStep === 1) {
            const requiredFields = ['companyName', 'industry', 'companySize', 'country'];
            for (const field of requiredFields) {
                const element = document.getElementById(field);
                if (!element || !element.value.trim()) {
                    alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                    return false;
                }
            }
        } else if (this.currentStep === 2) {
            const requiredFields = ['projectName', 'projectType', 'projectDuration'];
            for (const field of requiredFields) {
                const element = document.getElementById(field);
                if (!element || !element.value.trim()) {
                    alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                    return false;
                }
            }
        }
        return true;
    }
    
    collectFormData() {
        const fields = [
            'companyName', 'industry', 'companySize', 'country', 'companyDescription',
            'projectName', 'projectType', 'projectDuration', 'budgetRange', 
            'projectDescription', 'targetBeneficiaries'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                this.formData[field] = element.value;
            }
        });
    }
    
    updateStepDisplay() {
        // Update step indicators
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step-${i}`);
            const content = document.getElementById(`step-content-${i}`);
            
            if (step && content) {
                if (i === this.currentStep) {
                    step.classList.add('active');
                    content.classList.add('active');
                } else {
                    step.classList.remove('active');
                    content.classList.remove('active');
                }
            }
        }
    }
    
    startAnalysis() {
        const analysisSteps = document.querySelectorAll('.analysis-step');
        const progressFill = document.getElementById('analysisProgress');
        const progressText = document.getElementById('analysisProgressText');
        
        let currentStepIndex = 0;
        let progress = 0;
        
        const analysisInterval = setInterval(() => {
            // Update current step
            if (currentStepIndex < analysisSteps.length) {
                analysisSteps[currentStepIndex].classList.add('completed');
                analysisSteps[currentStepIndex].classList.remove('active');
                
                if (currentStepIndex + 1 < analysisSteps.length) {
                    analysisSteps[currentStepIndex + 1].classList.add('active');
                }
                
                currentStepIndex++;
                progress = (currentStepIndex / analysisSteps.length) * 100;
                
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
                
                if (progressText) {
                    progressText.textContent = `${Math.round(progress)}% Complete`;
                }
            } else {
                clearInterval(analysisInterval);
                setTimeout(() => {
                    this.nextStep();
                }, 1000);
            }
        }, 2000);
    }
    
    generateRecommendations() {
        const recommendations = this.calculateSDGRecommendations();
        this.displayRecommendations(recommendations);
    }
    
    calculateSDGRecommendations() {
        const { industry, projectType, projectDescription, targetBeneficiaries } = this.formData;
        
        // Simulate ML-based recommendations based on input
        let majorImpactGoals = [];
        let mediumImpactGoals = [];
        
        // Industry-based recommendations
        if (industry === 'energy' || projectType === 'renewable-energy') {
            majorImpactGoals.push(this.sdgDatabase[7]); // Clean Energy
            mediumImpactGoals.push(this.sdgDatabase[13]); // Climate Action
        }
        
        if (industry === 'technology' || projectType === 'technology') {
            majorImpactGoals.push(this.sdgDatabase[9]); // Industry, Innovation
            mediumImpactGoals.push(this.sdgDatabase[8]); // Decent Work
        }
        
        if (industry === 'healthcare' || projectType === 'healthcare') {
            majorImpactGoals.push(this.sdgDatabase[3]); // Good Health
            mediumImpactGoals.push(this.sdgDatabase[1]); // No Poverty
        }
        
        if (industry === 'education' || projectType === 'education') {
            majorImpactGoals.push(this.sdgDatabase[4]); // Quality Education
            mediumImpactGoals.push(this.sdgDatabase[5]); // Gender Equality
        }
        
        // Default recommendations if no specific match
        if (majorImpactGoals.length === 0) {
            majorImpactGoals = [this.sdgDatabase[8], this.sdgDatabase[12]]; // Decent Work, Responsible Consumption
            mediumImpactGoals = [this.sdgDatabase[9], this.sdgDatabase[17]]; // Industry Innovation, Partnerships
        }
        
        return {
            majorImpact: majorImpactGoals,
            mediumImpact: mediumImpactGoals,
            additional: this.generateAdditionalRecommendations()
        };
    }
    
    displayRecommendations(recommendations) {
        // Display major impact goals
        const majorContainer = document.getElementById('majorImpactGoals');
        if (majorContainer) {
            majorContainer.innerHTML = recommendations.majorImpact.map(sdg => 
                this.createSDGCard(sdg, 'major')
            ).join('');
        }
        
        // Display medium impact goals
        const mediumContainer = document.getElementById('mediumImpactGoals');
        if (mediumContainer) {
            mediumContainer.innerHTML = recommendations.mediumImpact.map(sdg => 
                this.createSDGCard(sdg, 'medium')
            ).join('');
        }
        
        // Display additional recommendations
        const additionalContainer = document.getElementById('additionalRecommendations');
        if (additionalContainer) {
            additionalContainer.innerHTML = recommendations.additional.map(rec => 
                `<div class="recommendation-item">
                    <span class="material-icons">lightbulb</span>
                    <span>${rec}</span>
                </div>`
            ).join('');
        }
    }
    
    createSDGCard(sdg, impactLevel) {
        return `
            <div class="sdg-card">
                <div class="sdg-header">
                    <div class="sdg-number">${sdg.number}</div>
                    <h4 class="sdg-title">${sdg.title}</h4>
                </div>
                <p class="sdg-description">${sdg.description}</p>
            </div>
        `;
    }
    
    generateAdditionalRecommendations() {
        return [
            "Consider implementing sustainable procurement practices",
            "Develop partnerships with local NGOs for community impact",
            "Establish regular sustainability reporting and monitoring",
            "Create employee engagement programs for sustainability initiatives",
            "Explore carbon offset programs for unavoidable emissions"
        ];
    }
    
    downloadReport() {
        // Create a simple report download
        const reportData = {
            company: this.formData.companyName,
            industry: this.formData.industry,
            project: this.formData.projectName,
            recommendations: this.calculateSDGRecommendations(),
            generatedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `SDG_Recommendations_${this.formData.companyName}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    initializeSDGDatabase() {
        return {
            1: {
                number: 1,
                title: "No Poverty",
                description: "End poverty in all its forms everywhere"
            },
            2: {
                number: 2,
                title: "Zero Hunger",
                description: "End hunger, achieve food security and improved nutrition"
            },
            3: {
                number: 3,
                title: "Good Health and Well-being",
                description: "Ensure healthy lives and promote well-being for all"
            },
            4: {
                number: 4,
                title: "Quality Education",
                description: "Ensure inclusive and equitable quality education"
            },
            5: {
                number: 5,
                title: "Gender Equality",
                description: "Achieve gender equality and empower all women and girls"
            },
            6: {
                number: 6,
                title: "Clean Water and Sanitation",
                description: "Ensure availability and sustainable management of water"
            },
            7: {
                number: 7,
                title: "Affordable and Clean Energy",
                description: "Ensure access to affordable, reliable, sustainable energy"
            },
            8: {
                number: 8,
                title: "Decent Work and Economic Growth",
                description: "Promote sustained, inclusive economic growth and employment"
            },
            9: {
                number: 9,
                title: "Industry, Innovation and Infrastructure",
                description: "Build resilient infrastructure and promote innovation"
            },
            10: {
                number: 10,
                title: "Reduced Inequalities",
                description: "Reduce inequality within and among countries"
            },
            11: {
                number: 11,
                title: "Sustainable Cities and Communities",
                description: "Make cities and human settlements inclusive and sustainable"
            },
            12: {
                number: 12,
                title: "Responsible Consumption and Production",
                description: "Ensure sustainable consumption and production patterns"
            },
            13: {
                number: 13,
                title: "Climate Action",
                description: "Take urgent action to combat climate change"
            },
            14: {
                number: 14,
                title: "Life Below Water",
                description: "Conserve and sustainably use oceans and marine resources"
            },
            15: {
                number: 15,
                title: "Life on Land",
                description: "Protect, restore and promote sustainable use of ecosystems"
            },
            16: {
                number: 16,
                title: "Peace, Justice and Strong Institutions",
                description: "Promote peaceful and inclusive societies for sustainable development"
            },
            17: {
                number: 17,
                title: "Partnerships for the Goals",
                description: "Strengthen the means of implementation and revitalize partnerships"
            }
        };
    }
}

// Initialize SDG recommendation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on recommended SDGs page
    if (window.location.pathname.includes('recommended-sdgs')) {
        window.sdgManager = new SDGRecommendationManager();
    }
});
