import { CashFlowEntry } from "../cashFlowEntry.js";

export class XirrCalculator {
    static calculate(cashFlowSet, currentValue) {
        const eps = 1e-10;
        const maxIter = 128;

        const f = (rate) =>
            this.calculateWithRate(cashFlowSet, currentValue.date, rate).amount / currentValue.amount - 1;

        let low = -0.9999999999999999;
        let high = 1;
        let fLow = f(low);
        let fHigh = f(high);

        for (let i = 0; i < 2046 && fLow * fHigh > 0; i++) {
            high *= 2;
            fHigh = f(high);
        }

        if (fLow * fHigh > 0 || isNaN(fHigh))
            throw new Error("Can't find XIRR, because exceeded precision limit of float for annual multiplier which is between -0.9999999999999999 and -1.");

        let mid;
        for (let i = 0; i < maxIter; i++) {
            mid = (low + high) / 2;
            const fMid = f(mid);

            if (Math.abs(fMid) < eps)
                return mid;

            if (fLow * fMid < 0) {
                high = mid;
                fHigh = fMid;
            } else {
                low = mid;
                fLow = fMid;
            }
        }
        return mid;
    }

    static calculateWithRate(cashFlowSet, date, rate) {
        let sum = 0;
        const msPerYear = 24 * 60 * 60 * 1000 * 365.25;

        cashFlowSet.cashflows.forEach(cashFlowEntry => {
            const time = (date - cashFlowEntry.date) / msPerYear;
            const timePower = Math.pow(1 + rate, time);
            sum += cashFlowEntry.amount * timePower;
        });
        return new CashFlowEntry(date, sum, cashFlowSet.cashflows[0].currency);
    }
}