// Funcionalidad para el formulario de financiamiento

document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const currencyButtons = document.querySelectorAll('.currency-btn');
    const currencySymbol = document.querySelector('.currency-symbol');
    const currencyCode = document.querySelector('.currency-code');
    const loanAmountInput = document.getElementById('loanAmount');
    const rangeLabels = document.querySelectorAll('.range-label');

    // Estado actual
    let currentCurrency = 'PEN';

    // Configuración de montos por moneda
    const currencyConfig = {
        PEN: {
            symbol: 'S/',
            code: 'PEN',
            min: '15 mil',
            max: '2 millones',
            minValue: 15000,
            maxValue: 2000000
        },
        USD: {
            symbol: '$',
            code: 'USD',
            min: '5 mil',
            max: '600 mil',
            minValue: 5000,
            maxValue: 600000
        }
    };

    // Cambio de moneda
    currencyButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remover clase active de todos los botones
            currencyButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase active al botón clickeado
            this.classList.add('active');

            // Obtener la moneda seleccionada
            currentCurrency = this.dataset.currency;

            // Actualizar UI
            updateCurrencyDisplay();
        });
    });

    // Actualizar display de moneda
    // Elementos adicionales
    const validationMessage = document.querySelector('.validation-message');
    const prequalifyButton = document.querySelector('.financing-form-card .btn-primary');

    // Inicializar estado del botón
    validateAmount();

    // Actualizar display de moneda
    function updateCurrencyDisplay() {
        const config = currencyConfig[currentCurrency];

        currencySymbol.textContent = config.symbol;
        currencyCode.textContent = config.code;
        rangeLabels[0].textContent = `Mínimo ${config.symbol}${config.min}`;
        rangeLabels[1].textContent = `Máximo ${config.symbol}${config.max}`;

        // Resetear a valor mínimo por defecto al cambiar moneda
        loanAmountInput.value = formatNumber(config.minValue);
        validateAmount();
    }

    // Formatear número con separadores de miles
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Remover formato de número
    function unformatNumber(str) {
        return str.replace(/,/g, '');
    }

    // Formatear input mientras se escribe y validar
    loanAmountInput.addEventListener('input', function (e) {
        let value = unformatNumber(e.target.value);
        value = value.replace(/[^\d]/g, '');

        if (value) {
            e.target.value = formatNumber(value);
        } else {
            e.target.value = '';
        }

        validateAmount();
    });

    // Función de validación principal
    function validateAmount() {
        const rawValue = unformatNumber(loanAmountInput.value);
        const value = parseInt(rawValue) || 0;
        const config = currencyConfig[currentCurrency];

        let isValid = true;
        let errorMessage = '';

        if (!rawValue) {
            isValid = false;
        } else if (value < config.minValue) {
            isValid = false;
            errorMessage = `El monto mínimo es ${config.symbol} ${formatNumber(config.minValue)}`;
        } else if (value > config.maxValue) {
            isValid = false;
            errorMessage = `El monto máximo es ${config.symbol} ${formatNumber(config.maxValue)}`;
        }

        // Actualizar UI
        if (isValid) {
            validationMessage.style.display = 'none';
            prequalifyButton.classList.remove('btn-disabled');
            prequalifyButton.style.opacity = '1';
            prequalifyButton.style.pointerEvents = 'auto';
            prequalifyButton.textContent = 'Precalifica ahora';
        } else {
            validationMessage.textContent = errorMessage;
            validationMessage.style.display = errorMessage ? 'block' : 'none';

            // Deshabilitar botón visualmente
            prequalifyButton.style.opacity = '0.5';
            prequalifyButton.style.pointerEvents = 'none';
            prequalifyButton.textContent = 'Monto fuera de rango';
        }

        return isValid;
    }

    // Click en botón (solo funcionará si pointer-events es auto, pero por seguridad validamos)
    prequalifyButton.addEventListener('click', function (e) {
        if (!validateAmount()) {
            e.preventDefault();
        } else {
            // Guardar valores en URL también para la siguiente página
            const rawValue = unformatNumber(loanAmountInput.value);
            this.href = `precalificacion.html?amount=${rawValue}&currency=${currentCurrency}`;
        }
    });

});
