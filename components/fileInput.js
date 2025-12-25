class FileInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const label = this.getAttribute('label');
        const inputLabel = this.getAttribute('file-extension') || 'Failas';
        const accepts = this.getAttribute('accept');
        const noFilePlaceholder = "Pasirinkti failą";

        this.shadowRoot.innerHTML = `
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <div class="row mb-3 align-items-center">
            <div class="col-md-4">
                <label class="form-label">${label}</label>
            </div>
            <div class="col-md-4">
                <div class="input-group mb-3">
                    <label class="form-control btn btn-secondary">
                        <span id="placeholder">${noFilePlaceholder}</span>
                        <input type="file" accept="${accepts}" class="form-control" hidden>
                        <div id="error" class="invalid-feedback"></div>
                    </label>
                    <span class="input-group-text">${inputLabel}</span>
                </div>
            </div>
        </div>`;

        this.placeholder = this.shadowRoot.getElementById('placeholder');
        this.input = this.shadowRoot.querySelector('input');
        this.error = this.shadowRoot.getElementById('error');

        this.input.addEventListener('change', () => {
            this.placeholder.textContent = this.input.files.length ? this.input.files[0].name : noFilePlaceholder;
            this.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                composed: true
            }));
        });
    }

    getFile() {
        return this.input.files[0] ?? null;
    }

    isValid() {
        return this.input.files.length > 0;
    }

    showError(message) {
        this.error.textContent = message;
        this.input.classList.add("is-invalid");
    }

    clearError() {
        this.input.classList.remove("is-invalid");
    }
}
customElements.define('file-input', FileInput);