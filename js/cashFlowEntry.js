import { Cash } from './cash.js';
import { Currency } from './currency.js';

export class CashFlowEntry extends Cash {
    /** @type {Date} */
    date;

    /**
     * @param {Date} date
     * @param {number} amount
     * @param {Currency} currency
     */
    constructor(date, amount, currency) {
        super(amount, currency);
        this.date = date;
    }
}