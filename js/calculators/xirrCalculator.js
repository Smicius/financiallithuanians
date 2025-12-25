import { CashFlowEntry } from "../cashFlowEntry.js";

export class XirrCalculator {
    static calculate(cashFlowEntries, currentValue) {
        let rate = 0.1;
        let rateChange = 0.08;
        let iterationsLeft = 128;
        let lastDirection = null;
        const eps = 1e-7;

        let portfolioValue;
        do {
            portfolioValue = this.calculateWithRate(cashFlowEntries, currentValue.date, rate);

            if (portfolioValue.amount > currentValue.amount) {
                if (rate - rateChange < -1) {
                    rate = -1;
                    rateChange = 0.08;
                } else {
                    rate = rate - rateChange;
                    if (lastDirection != null)
                        rateChange *= lastDirection > 0 || rate - rateChange * 2 < -1 ? 0.5 : 2;
                }
                lastDirection = -1;
            } else {
                rate += rateChange;
                if (lastDirection != null)
                    rateChange *= lastDirection > 0 ? 2 : 0.5;
                lastDirection = 1;
            }
            iterationsLeft--;
        } while (iterationsLeft > 0 && Math.abs(portfolioValue.amount - currentValue.amount) > eps);
        return rate;
    }

    static calculateWithRate(cashFlowEntries, date, rate) {
        let sum = 0;
        const msPerYear = 24 * 60 * 60 * 1000 * 365.25;

        cashFlowEntries.forEach(cashFlowEntry => {
            const time = (date - cashFlowEntry.date) / msPerYear;
            const timePower = Math.pow(1 + rate, time);
            sum += cashFlowEntry.amount * timePower;
        });
        return new CashFlowEntry(date, sum, cashFlowEntries[0].currency);
    }
}