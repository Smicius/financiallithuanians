import { CashFlowEntry } from './cashFlowEntry.js';
import { Currency } from './currency.js';

export class CashFlowSet {
    /** @type {CashFlowEntry[]} */
    cashflows;

    /**
     * @param {CashFlowEntry[]} cashflows
     */
    constructor(cashflows) {
        this.cashflows = cashflows;
    }

    /**
     * @param {Currency} targetCurrency
     */
    changeCurrencyTo(targetCurrency) {
        this.cashflows.forEach(cashflow => {
            cashflow.convertTo(targetCurrency);
        });
    }
}