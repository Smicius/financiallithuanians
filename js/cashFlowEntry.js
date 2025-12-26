import { Currency } from './currency.js';

export class CashFlowEntry {
    /** @type {Date} */
    date;

    /** @type {number} */
    amount;

    /** @type {Currency} */
    currency;

    /** @type {number} */
    originalAmount;

    /** @type {Currency} */
    originalCurrency;

    /**
     * @param {Date} date
     * @param {number} amount
     * @param {Currency} currency
     */
    constructor(date, amount, currency) {
        this.date = date;
        this.amount = this.originalAmount = amount;
        this.currency = this.originalCurrency = currency;
    }

    /**
     * @param {Currency} targetCurrency
     */
    convertTo(targetCurrency) {
        if (targetCurrency.name == this.currency.name)
            return;

        this.amount /= this.currency.convertRatio(targetCurrency)
        this.currency = targetCurrency;
    }

    /**
     * @returns {string}
     */
    getAmountDisplayValue() {
        const str = this.amount.toFixed(2) + " " + this.currency.symbol;
        if (this.originalCurrency.name != this.currency.name)
            str += " (" + this.originalAmount.toFixed(2) + " " + this.originalCurrency.symbol
        return str;
    }
}