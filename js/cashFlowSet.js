export class CashFlowSet {
    constructor(cashflows) {
        this.cashflows = cashflows;
    }

    changeCurrencyTo(targetCurrency) {
        this.cashflows.forEach(cashflow => {
            cashflow.convertTo(targetCurrency);
        });
    }
}