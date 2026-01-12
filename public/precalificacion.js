// Precalificación - Formulario Multi-Paso

let currentStep = 1;
const totalSteps = 2;

// Inicializar
// Inicializar
document.addEventListener('DOMContentLoaded', function () {
    updateProgress();
    setupValidation();
    setupFormatting();

    // Pre-llenar datos desde URL si existen
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');

    if (amount) {
        const amountInput = document.getElementById('loanAmount');
        if (amountInput) {
            amountInput.value = formatNumber(amount);
        }
    }

    if (currency) {
        const currencySelect = document.getElementById('currency');
        if (currencySelect) {
            currencySelect.value = currency;
            // Disparar evento change para actualizar validaciones visuales si las hay
            currencySelect.dispatchEvent(new Event('change'));
        }
    }
});

// Navegación entre pasos
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateProgress();

            // Si es el paso 2, mostrar resumen
            if (currentStep === 2) {
                showSummary();
            }
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((stepEl, index) => {
        if (index + 1 === step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });

    // Actualizar título
    const titles = {
        1: 'Completa tus datos para empezar tu precalificación',
        2: 'Confirma tu información'
    };
    document.getElementById('stepTitle').textContent = titles[step];

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.querySelector('.progress-text');

    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `Paso ${currentStep} de ${totalSteps}`;
}

// Validación
function validateCurrentStep() {
    const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required]');

    let isValid = true;

    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (!input.checked) {
                isValid = false;
                showError(input, 'Este campo es obligatorio');
            } else {
                clearError(input);
            }
        } else if (input.type === 'radio') {
            const radioGroup = currentStepEl.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                showError(input, 'Debes seleccionar una opción');
            } else {
                clearError(input);
            }
        } else {
            if (!input.value.trim()) {
                isValid = false;
                showError(input, 'Este campo es obligatorio');
            } else if (input.type === 'email' && !isValidEmail(input.value)) {
                isValid = false;
                showError(input, 'Ingresa un correo válido');
            } else if (input.id === 'dni' && !isValidDNI(input.value)) {
                isValid = false;
                showError(input, 'El DNI debe tener 8 dígitos');
            } else if ((input.id === 'phone' || input.id === 'optionalPhone') && input.value && !isValidPhone(input.value)) {
                isValid = false;
                showError(input, 'El teléfono debe tener 9 dígitos');
            } else {
                clearError(input);
            }
        }
    });

    return isValid;
}

function setupValidation() {
    const form = document.getElementById('prequalificationForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (validateCurrentStep()) {
            // Aquí enviarías los datos al servidor...
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            console.log('Datos del formulario:', data);

            // Simular carga enviando datos
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Ocultar spinner
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Transición al Paso 3 (Éxito)
                document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');

                // Ocultar elementos de navegación/progreso que ya no son relevantes
                document.getElementById('stepTitle').style.display = 'none';
                document.querySelector('.progress-container').style.display = 'none';
                document.querySelector('.prequalification-sidebar').style.display = 'none'; // Opcional: Ocultar sidebar o mantenerla
                document.querySelector('.prequalification-layout').style.gridTemplateColumns = '1fr'; // Hacer full width

                // Mostrar paso de éxito
                const successStep = document.getElementById('successStep');
                successStep.classList.add('active');
                successStep.style.display = 'block'; // Asegurar display block si estaba hidden

                // Inicializar FAQ
                setupFAQ();

                // Scroll arriba
                window.scrollTo({ top: 0, behavior: 'smooth' });

            }, 1000); // Simular 1 segundo de delay
        }
    });
}

function setupFAQ() {
    const faqToggles = document.querySelectorAll('.faq-toggle');

    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Cerrar otros (opcional, acordeón estricto)
            // faqToggles.forEach(other => {
            //     if (other !== toggle) {
            //         other.classList.remove('active');
            //     }
            // });

            toggle.classList.toggle('active');
        });
    });
}

// Formateo de campos
function setupFormatting() {
    // DNI - solo números, máximo 8
    const dniInput = document.getElementById('dni');
    dniInput.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
    });

    // Teléfonos - solo números, máximo 9
    const phoneInputs = [document.getElementById('phone'), document.getElementById('optionalPhone')];
    phoneInputs.forEach(input => {
        input.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
        });
    });

    // Monto - formatear con comas
    const loanAmountInput = document.getElementById('loanAmount');
    loanAmountInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/,/g, '');
        value = value.replace(/\D/g, '');

        if (value) {
            e.target.value = formatNumber(value);
        } else {
            e.target.value = '';
        }
    });

    // Actualizar hint al cambiar moneda
    const currencySelect = document.getElementById('currency');
    currencySelect.addEventListener('change', function () {
        const hint = document.querySelector('.form-hint');
        if (this.value === 'USD') {
            hint.textContent = 'Mín: $ 5 mil - Máx: $ 600 mil';
        } else {
            hint.textContent = 'Mín: S/ 15 mil - Máx: S/ 2 millones';
        }
    });
}

// Mostrar resumen en paso 2
function showSummary() {
    const summaryContainer = document.getElementById('dataSummary');
    const formData = new FormData(document.getElementById('prequalificationForm'));

    const labels = {
        dni: 'DNI',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        optionalPhone: 'Teléfono opcional',
        loanPurpose: 'Motivo del préstamo',
        loanAmount: 'Monto solicitado',
        currency: 'Moneda',
        hasProperty: 'Tiene propiedad',
        hasReceipt: 'Tiene comprobante'
    };

    const purposeLabels = {
        'capital-trabajo': 'Capital de trabajo',
        'construccion': 'Construcción',
        'consolidar-deudas': 'Consolidar deudas',
        'traslado-deuda': 'Traslado de deuda',
        'libre-disponibilidad': 'Libre disponibilidad',
        'otro': 'Otro'
    };

    let html = '<div class="summary-grid">';

    for (let [key, value] of formData.entries()) {
        if (key === 'acceptTerms' || !value) continue;

        let displayValue = value;

        if (key === 'loanPurpose') {
            displayValue = purposeLabels[value] || value;
        } else if (key === 'currency') {
            displayValue = value === 'PEN' ? 'Soles (S/)' : 'Dólares ($)';
        } else if (key === 'hasProperty') {
            displayValue = 'Sí';
        } else if (key === 'hasReceipt') {
            displayValue = value === 'si' ? 'Sí' : 'No';
        } else if (key === 'loanAmount') {
            const currency = formData.get('currency') === 'USD' ? '$' : 'S/';
            displayValue = `${currency} ${value}`;
        }

        html += `
            <div class="summary-item">
                <div class="summary-label">${labels[key] || key}</div>
                <div class="summary-value">${displayValue}</div>
            </div>
        `;
    }

    html += '</div>';
    summaryContainer.innerHTML = html;
}

// Utilidades
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDNI(dni) {
    return /^\d{8}$/.test(dni);
}

function isValidPhone(phone) {
    return /^\d{9}$/.test(phone);
}

function showError(input, message) {
    const formGroup = input.closest('.form-group') || input.closest('.checkbox-group') || input.closest('.radio-group');

    // Remover error anterior si existe
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Agregar clase de error
    formGroup.classList.add('has-error');

    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

function clearError(input) {
    const formGroup = input.closest('.form-group') || input.closest('.checkbox-group') || input.closest('.radio-group');
    formGroup.classList.remove('has-error');

    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Funcionalidad de pestañas en el sidebar
document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabName = this.dataset.tab;

            // Remover clase active de todos los botones y paneles
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Agregar clase active al botón clickeado
            this.classList.add('active');

            // Mostrar el panel correspondiente
            const targetPanel = document.getElementById(`tab-${tabName}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
});

// ============================================
// SISTEMA DE UBICACIONES DE PERÚ CON API
// ============================================

let peruData = null;

// Cargar datos de ubigeos desde API
async function loadUbigeosData() {
    try {
        // API gratuita de ubigeos de Perú (e-api.net.pe)
        const response = await fetch('https://free.e-api.net.pe/ubigeos.json');

        if (!response.ok) {
            throw new Error('API no disponible');
        }

        const data = await response.json();
        console.log('✅ Datos cargados desde API:', data.length, 'ubigeos');
        return processApiData(data);
    } catch (error) {
        console.error('❌ Error cargando ubigeos desde API:', error);
        alert('No se pudieron cargar las ubicaciones. Por favor, verifica tu conexión.');
        return {};
    }
}

// Procesar datos de la API (Estructura de objeto anidado)
function processApiData(data) {
    const processed = {};

    // La API devuelve un objeto donde las claves son los departamentos
    // Ejemplo: { "AMAZONAS": { "CHACHAPOYAS": { ... } } }
    Object.keys(data).forEach(deptName => {
        const provincesObj = data[deptName];
        const formattedDept = capitalizeWords(deptName);

        processed[formattedDept] = {};

        Object.keys(provincesObj).forEach(provName => {
            const districtsObj = provincesObj[provName];
            const formattedProv = capitalizeWords(provName);

            // Los distritos están dentro del objeto de la provincia
            const districts = Object.keys(districtsObj).map(d => capitalizeWords(d));

            processed[formattedDept][formattedProv] = districts.sort();
        });
    });

    return processed;
}

// Función para capitalizar palabras
function capitalizeWords(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}



// Inicializar selectores de ubicación con API
document.addEventListener('DOMContentLoaded', async function () {
    const departmentSelect = document.getElementById('department');
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');

    if (!departmentSelect || !provinceSelect || !districtSelect) return;

    // Cargar datos de ubigeos
    peruData = await loadUbigeosData();

    // Llenar departamentos
    departmentSelect.innerHTML = '<option value="">Departamento</option>';
    Object.keys(peruData).sort().forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });

    // Cuando cambia el departamento
    departmentSelect.addEventListener('change', function () {
        const selectedDept = this.value;

        // Limpiar provincia y distrito
        provinceSelect.innerHTML = '<option value="">Provincia</option>';
        districtSelect.innerHTML = '<option value="">Selecciona un distrito</option>';
        provinceSelect.disabled = !selectedDept;
        districtSelect.disabled = true;

        if (selectedDept && peruData[selectedDept]) {
            const provinces = Object.keys(peruData[selectedDept]).sort();
            provinces.forEach(prov => {
                const option = document.createElement('option');
                option.value = prov;
                option.textContent = prov;
                provinceSelect.appendChild(option);
            });
        }
    });

    // Cuando cambia la provincia
    provinceSelect.addEventListener('change', function () {
        const selectedDept = departmentSelect.value;
        const selectedProv = this.value;

        // Limpiar distrito
        districtSelect.innerHTML = '<option value="">Selecciona un distrito</option>';
        districtSelect.disabled = !selectedProv;

        if (selectedDept && selectedProv && peruData[selectedDept][selectedProv]) {
            const districts = peruData[selectedDept][selectedProv].sort();
            districts.forEach(dist => {
                const option = document.createElement('option');
                option.value = dist;
                option.textContent = dist;
                districtSelect.appendChild(option);
            });
        }
    });

    // Inicialmente deshabilitar provincia y distrito
    provinceSelect.disabled = true;
    districtSelect.disabled = true;
});
