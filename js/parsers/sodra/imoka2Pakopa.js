import { PDFParse } from 'https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf-parse.es.js';
import { CashFlowEntry } from '../../cashFlowEntry.js';
import { CashFlowSet } from '../../cashFlowSet.js';
import { Currency } from '../../currency.js';

PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs');

export class Imoka2Pakopa extends CashFlowEntry {
    constructor(dalyvioImoka, sodrosImoka, valstybesPaskata) {
        super(dalyvioImoka.date, dalyvioImoka.amount + sodrosImoka.amount + valstybesPaskata.amount, dalyvioImoka.currency);

        this.dalyvioImoka = dalyvioImoka
        this.sodrosImoka = sodrosImoka
        this.valstybesPaskata = valstybesPaskata
    }

    static async import(fileText) {
        const rows = await this.getMainTable(fileText);
        const header = rows[0];

        const indexOfDateColumn = header.findIndex(cell => cell.toLowerCase().includes("pervedimo data"));
        const indexOfUserDeposit = header.findIndex(cell => cell.toLowerCase().includes("dalyvio lėšomis mokamų įmokų suma"));
        const indexOfSodrosImoka = header.findIndex(cell => cell.toLowerCase().includes("pensijų kaupimo\nįmokų\nsuma"));
        const indexOfValstybesPaskata = header.findIndex(cell => cell.toLowerCase().includes("valstybės biudžeto lėšomis už dalyvį mokamų įmokų suma"));
        const indexOfCurrency = header.findIndex(cell => cell.toLowerCase().includes("valiuta"));

        const cashFlowEntries = []
        let lastDate;
        for (let rowIndex = 1; ; rowIndex++) {
            if (rowIndex >= rows.length)
                break;

            const currentRow = rows[rowIndex];

            if (currentRow[indexOfDateColumn].trim() !== '') {
                lastDate = new Date(currentRow[indexOfDateColumn]);
                continue;
            } else {
                const currency = Currency.Parse(currentRow[indexOfCurrency]);
                const dalyvioAmount = Number(currentRow[indexOfUserDeposit].replace(',', '.'))
                const sodrosAmount = Number(currentRow[indexOfSodrosImoka]?.replace(',', '.'))
                const valstybesPaskatosAmount = Number(currentRow[indexOfValstybesPaskata]?.replace(',', '.'))

                const dalyvioImoka = new CashFlowEntry(lastDate, dalyvioAmount, currency);
                const sodrosImoka = new CashFlowEntry(lastDate, sodrosAmount, currency);
                const valstybesPaskata = new CashFlowEntry(lastDate, valstybesPaskatosAmount, currency);
                const imoka2Pakopa = new Imoka2Pakopa(dalyvioImoka, sodrosImoka, valstybesPaskata);
                cashFlowEntries.push(imoka2Pakopa);
            }
        }
        return new CashFlowSet(cashFlowEntries);
    }

    static async getMainTable(fileText) {
        const tables = await this.getTables(fileText);
        return tables.reduce((maxArr, current) => current.length > maxArr.length ? current : maxArr, tables[0]);
    }

    static getTables(fileText) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(reader.result, "text/html");
                const tables = doc.querySelectorAll("table");
                const tablesArray = [];
                tables.forEach(table => {
                    const rows = table.querySelectorAll("tr");
                    const rowArray = [];
                    rows.forEach(row => {
                        const cells = row.querySelectorAll("td");
                        const cellArray = [];
                        cells.forEach(cell => {
                            cellArray.push(cell.textContent);
                        });
                        rowArray.push(cellArray)
                    });
                    tablesArray.push(rowArray);
                });
                resolve(tablesArray);
            };
            reader.onerror = reject
            reader.readAsText(fileText);
        })
    }
}