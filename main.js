import { Imoka2Pakopa } from "./js/parsers/sodra/imoka2Pakopa.js";
import { XirrCalculator } from "./js/calculators/xirrCalculator.js";
import { CashFlowEntry } from "./js/cashFlowEntry.js";
import { Currency } from "./js/currency.js";

const portfolioValueInput = document.getElementById('currentPortfolio');
const fileInput = document.getElementById('htmlFile');
const fundXirrField = document.getElementById('fundXirr');
const dalyvioImokuXirrField = document.getElementById('dalyvioImokuXirr');
const imokosField = document.getElementById('imokos');

fileInput.addEventListener('change', async (event) => {
    const file = fileInput.getFile();
    const cashflows = await Imoka2Pakopa.import(file);

    cashflows.forEach(cashflow => {
        cashflow.convertTo(Currency.EUR);
    });

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    const fundRateOfReturn = XirrCalculator.calculate(cashflows, new CashFlowEntry(today, parseFloat(portfolioValueInput.value), Currency.EUR));
    const fundRateStr = (fundRateOfReturn * 100).toFixed(2) + " %"
    fundXirrField.textContent = "Fondo vidutinė metinė grąža (IRR) = " + fundRateStr;

    const dalyvioImokuRateOfReturn = XirrCalculator.calculate(cashflows.map(cashflow => cashflow.dalyvioImoka), new CashFlowEntry(today, parseFloat(portfolioValueInput.value), Currency.EUR));
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
    cashflows.forEach(cashflow => {
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
        row.insertCell().textContent = XirrCalculator.calculateWithRate([cashflow], today, fundRateOfReturn).getAmountDisplayValue();
        row.insertCell().textContent = XirrCalculator.calculateWithRate([cashflow.dalyvioImoka], today, dalyvioImokuRateOfReturn).getAmountDisplayValue();
    });

    const sumRow = document.createElement('tr');
    sumRow.style.fontWeight = 'bold';
    body.appendChild(sumRow);
    sumRow.insertCell();
    sumRow.insertCell().textContent = new CashFlowEntry(today, dalyvioImokaSum, Currency.EUR).getAmountDisplayValue();
    sumRow.insertCell().textContent = new CashFlowEntry(today, sodrosImokaSum, Currency.EUR).getAmountDisplayValue();
    sumRow.insertCell().textContent = new CashFlowEntry(today, valstybesPaskataSum, Currency.EUR).getAmountDisplayValue();
    sumRow.insertCell().textContent = new CashFlowEntry(today, fondoImokaSum, Currency.EUR).getAmountDisplayValue();
    sumRow.insertCell().textContent = sumRow.insertCell().textContent = XirrCalculator.calculateWithRate(cashflows, today, fundRateOfReturn).getAmountDisplayValue();
});