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

    constructor(name, symbol, constantConvertRatio) {
        this.name = name;
        this.symbol = symbol;
        this.constantConvertRatio = constantConvertRatio;
    }

    convertRatio(targetCurrency, date) {
        return this.constantConvertRatio[targetCurrency.name]
    }

    static Parse(str) {
        const strLower = str.trim().toLowerCase();
        return this.currencyCache[strLower];
    }
}