import { Currency } from './currency.js';

export class Cash {
    /** @type {number} */
    amount;

    /** @type {Currency} */
    currency;

    /** @type {number} */
    originalAmount;

    /** @type {Currency} */
    originalCurrency;

    /**
     * @param {number} amount
     * @param {Currency} currency
     */
    constructor(amount, currency) {
        this.amount = this.originalAmount = amount;
        this.currency = this.originalCurrency = currency;
    }

    /**
     * @param {Currency} targetCurrency
     */
    convertTo(targetCurrency) {
        if (targetCurrency.name == this.currency.name)
            return;

        const converted = this.getConvertedTo(targetCurrency);
        this.amount = converted.amount;
        this.currency = converted.currency;
    }

    /**
     * @param {Currency} targetCurrency
     */
    getConvertedTo(targetCurrency) {
        if (targetCurrency.name == this.currency.name)
            return;

        return new Cash(this.amount / this.currency.convertRatio(targetCurrency), targetCurrency);
    }

    /**
     * @returns {string}
     */
    getAmountDisplayValue() {
        let str = this.amount.toFixed(2) + " " + this.currency.symbol;
        if (this.originalCurrency.name != this.currency.name)
            str += " (" + this.originalAmount.toFixed(2) + " " + this.originalCurrency.symbol + ")"
        return str;
    }
}