// ✅ Utilidades simplificadas para financiamientos
// Todos los cálculos complejos se hacen en el backend

export const financingUtils = {
    /**
     * Calcula preview básico para formularios (solo para UI, no para persistencia)
     */
    calculatePreview: (loanAmount, interestRate, termMonths, downPayment = 0) => {
        const netAmount = loanAmount - downPayment;
        
        if (interestRate === 0) {
            return {
                monthlyPayment: netAmount / termMonths,
                totalToPay: netAmount,
                totalInterest: 0
            };
        }

        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = netAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
            (Math.pow(1 + monthlyRate, termMonths) - 1);

        const totalToPay = monthlyPayment * termMonths;
        
        return {
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalToPay: Math.round(totalToPay * 100) / 100,
            totalInterest: Math.round((totalToPay - netAmount) * 100) / 100
        };
    },

    /**
     * Validaciones básicas
     */
    validateFinancingData: (data) => {
        const errors = [];
        
        if (!data.loanAmount || data.loanAmount <= 0) {
            errors.push('El monto del préstamo debe ser mayor a 0');
        }
        
        if (!data.interestRate || data.interestRate < 0 || data.interestRate > 50) {
            errors.push('La tasa de interés debe estar entre 0% y 50%');
        }
        
        if (!data.termMonths || data.termMonths <= 0 || data.termMonths > 600) {
            errors.push('El plazo debe estar entre 1 y 600 meses');
        }
        
        const downPayment = data.downPayment || 0;
        if (downPayment < 0 || downPayment > data.loanAmount) {
            errors.push('La cuota inicial debe ser mayor o igual a 0 y menor al monto del préstamo');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}; 