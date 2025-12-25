import { CashFlowEntry } from "./../js/cashFlowEntry.js";
import { Currency } from "./../js/currency.js";

class CashFlowEntryInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const label = this.getAttribute('label');

        this.shadowRoot.innerHTML = `
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="./css/style.css" rel="stylesheet">
        <div class="row mb-3 align-items-center">
            <div class="col-md-4">
                <label class="form-label">${label}</label>
            </div>
            <div class="col-md-4">
                <div class="input-group">
                    <input type="number" step="any" class="form-control">
                    <span class="input-group-text">€</span>
                    <div id="error" class="invalid-feedback"></div>
                </div>
            </div>
        </div>
        <style>
            /* Chrome, Edge, Safari */
            input[type=number]::-webkit-outer-spin-button,
            input[type=number]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            /* Firefox */
            input[type=number] {
                -moz-appearance: textfield;
            }
        </style>`;

        this.input = this.shadowRoot.querySelector('input');
        this.error = this.shadowRoot.getElementById('error');

        this.input.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                composed: true
            }));
        });
    }

    getCashFlowEntry() {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return new CashFlowEntry(today, parseFloat(this.input.value), Currency.EUR);
    }

    isValid() {
        return this.input.value != null;
    }

    showError(message) {
        this.error.textContent = message;
        this.input.classList.add("is-invalid");
    }

    clearError() {
        this.input.classList.remove("is-invalid");
    }
}
customElements.define('cash-flow-entry-input', CashFlowEntryInput);