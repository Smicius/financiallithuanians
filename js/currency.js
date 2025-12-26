export class Currency {
    static EUR = new Currency("EUR", "€")
    static LTL = new Currency("LTL", "Lt", {
        "EUR": 3.4528
    })

    static currencyCache = {
        "eur": this.EUR,
        "lt": this.LTL,
        "ltl": this.LTL,
    }

    /** @type {string} */
    name;

    /** @type {string} */
    symbol;

    /** @type {number} */
    constantConvertRatio;

    /**
     * @param {string} name
     * @param {string} symbol
     * @param {number} constantConvertRatio
     */
    constructor(name, symbol, constantConvertRatio) {
        this.name = name;
        this.symbol = symbol;
        this.constantConvertRatio = constantConvertRatio;
    }

    /**
     * @param {Currency} targetCurrency
     * @param {Date | null} date
     * @returns {number}
     */
    convertRatio(targetCurrency, date) {
        return this.constantConvertRatio[targetCurrency.name]
    }

    /**
     * @param {string} str
     * @returns {Currency}
     */
    static Parse(str) {
        const strLower = str.trim().toLowerCase();
        return this.currencyCache[strLower];
    }
}