import { Imoka2Pakopa } from "./js/parsers/sodra/imoka2Pakopa.js";
import { XirrCalculator } from "./js/calculators/xirrCalculator.js";
import { CashFlowEntry } from "./js/cashFlowEntry.js";
import { CashFlowSet } from '../js/cashFlowSet.js';
import { Currency } from "./js/currency.js";

const portfolioValueInput = document.getElementById('currentPortfolio');
const fileInput = document.getElementById('htmlFile');
const calcError = document.getElementById("calcError");
const fundXirrField = document.getElementById('fundXirr');
const dalyvioImokuXirrField = document.getElementById('dalyvioImokuXirr');
const imokosField = document.getElementById('imokos');

function doStuff(cashflowSet, portfolioValue) {
    try {
        if (cashflowSet == null || portfolioValue == null)
            return;

        cashflowSet.changeCurrencyTo(Currency.EUR);

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        const fundRateOfReturn = XirrCalculator.calculate(cashflowSet, portfolioValue);
        const fundRateStr = (fundRateOfReturn * 100).toFixed(2) + " %"
        fundXirrField.textContent = "Fondo vidutinė metinė grąža (IRR) = " + fundRateStr;

        const dalyvioImokuRateOfReturn = XirrCalculator.calculate(new CashFlowSet(cashflowSet.cashflows.map(cashflow => cashflow.dalyvioImoka)), portfolioValue);
        const dalyvioImokuStr = (dalyvioImokuRateOfReturn * 100).toFixed(2) + " %";
        dalyvioImokuXirrField.textContent = "Vidutinė metinė grąža nuo jūsų įmokų (IRR) = " + dalyvioImokuStr;

        while (imokosField.rows.length > 0)
            imokosField.deleteRow(0);

        const headerRow = document.createElement('tr');
        headerRow.style.fontWeight = 'bold';
        const header = document.createElement('thead');
        header.appendChild(headerRow);
        imokosField.appendChild(header);
        headerRow.insertCell().textContent = "Data";
        headerRow.insertCell().textContent = "Dalyvio įmoka";
        headerRow.insertCell().textContent = "Sodros įmoka";
        headerRow.insertCell().textContent = "Valstybės paskata";
        headerRow.insertCell().textContent = "Įmokėta į fondą";
        headerRow.insertCell().textContent = "Fondo vertė šiandien nuo pilnos įmokos su " + fundRateStr + " grąža";
        headerRow.insertCell().textContent = "Fondo vertė šiandien nuo dalyvio įmokos su " + dalyvioImokuStr + " grąža";

        const body = document.createElement('tbody');
        imokosField.appendChild(body);
        let dalyvioImokaSum = 0;
        let sodrosImokaSum = 0;
        let valstybesPaskataSum = 0;
        let fondoImokaSum = 0;
        cashflowSet.cashflows.forEach(cashflow => {
            dalyvioImokaSum += cashflow.dalyvioImoka.amount;
            sodrosImokaSum += cashflow.sodrosImoka.amount;
            valstybesPaskataSum += cashflow.valstybesPaskata.amount;
            fondoImokaSum += cashflow.amount;

            const row = body.insertRow();
            row.insertCell().textContent = cashflow.date.toLocaleDateString();
            row.insertCell().textContent = cashflow.dalyvioImoka.getAmountDisplayValue();
            row.insertCell().textContent = cashflow.sodrosImoka.getAmountDisplayValue();
            row.insertCell().textContent = cashflow.valstybesPaskata.getAmountDisplayValue();
            row.insertCell().textContent = cashflow.getAmountDisplayValue();
            row.insertCell().textContent = XirrCalculator.calculateWithRate(new CashFlowSet([cashflow]), today, fundRateOfReturn).getAmountDisplayValue();
            row.insertCell().textContent = XirrCalculator.calculateWithRate(new CashFlowSet([cashflow.dalyvioImoka]), today, dalyvioImokuRateOfReturn).getAmountDisplayValue();
        });

        const sumRow = document.createElement('tr');
        sumRow.style.fontWeight = 'bold';
        body.appendChild(sumRow);
        sumRow.insertCell();
        sumRow.insertCell().textContent = new CashFlowEntry(today, dalyvioImokaSum, Currency.EUR).getAmountDisplayValue();
        sumRow.insertCell().textContent = new CashFlowEntry(today, sodrosImokaSum, Currency.EUR).getAmountDisplayValue();
        sumRow.insertCell().textContent = new CashFlowEntry(today, valstybesPaskataSum, Currency.EUR).getAmountDisplayValue();
        sumRow.insertCell().textContent = new CashFlowEntry(today, fondoImokaSum, Currency.EUR).getAmountDisplayValue();
        sumRow.insertCell().textContent = sumRow.insertCell().textContent = XirrCalculator.calculateWithRate(cashflowSet, today, fundRateOfReturn).getAmountDisplayValue();
        calcError.classList.add("d-none");
    } catch (exception) {
        calcError.textContent = exception;
        calcError.classList.remove("d-none");
    }
}

let portfolioValue = null, cashflowSet = null;
portfolioValueInput.addEventListener('change', async (event) => {
    try {
        portfolioValue = portfolioValueInput.getCashFlowEntry();
        if (portfolioValue.amount < 0 || isNaN(portfolioValue.amount))
            throw new Error(`Reikšmė turi būti tarp (0; ${Number.MAX_VALUE}) €!`);
        portfolioValueInput.clearError();

        doStuff(cashflowSet, portfolioValue);
    } catch (exception) {
        portfolioValueInput.showError(exception);
    }
});

fileInput.addEventListener('change', async (event) => {
    try {
        const file = fileInput.getFile();
        cashflowSet = await Imoka2Pakopa.import(file);
        fileInput.clearError();

        doStuff(cashflowSet, portfolioValue);
    } catch (exception) {
        fileInput.showError("Nepavyko perskaityti failo struktūros!");
    }
});