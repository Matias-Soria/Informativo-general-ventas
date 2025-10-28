// =======================================================================
// COMPARADOR DE EQUIPAMIENTOS (VERSIÓN CORREGIDA)
// =======================================================================
function initComparadorEquipamientos() {
    // Variables globales
    let modelosData = [];
    let modeloSeleccionadoA = null;
    let modeloSeleccionadoB = null;

    // Elementos del DOM
    const selectModeloA = document.getElementById('modeloA');
    const selectVersionA = document.getElementById('versionA');
    const selectModeloB = document.getElementById('modeloB');
    const selectVersionB = document.getElementById('versionB');
    const selectCategoria = document.getElementById('categoria');
    const resetBtn = document.getElementById('reset-btn');
    const resultsContainer = document.getElementById('results');
    const modeloAHeader = document.getElementById('modelA-header');
    const modeloBHeader = document.getElementById('modelB-header');

    // Cargar datos iniciales CON MEJOR DEBUG
    fetch('./Json/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status + ' - ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos JSON cargados:', data);

            // Validar estructura de datos
            if (!Array.isArray(data)) {
                throw new Error('El JSON no es un array');
            }

            if (data.length === 0) {
                throw new Error('El JSON está vacío');
            }

            // Verificar estructura de cada item
            data.forEach((item, index) => {
                if (!item.modelo || !item.version) {
                    console.warn(`Item ${index} no tiene modelo o versión:`, item);
                }

                // Asegurar que equipamiento sea un array
                if (!item.equipamiento || !Array.isArray(item.equipamiento)) {
                    console.warn(`Item ${index} no tiene equipamiento como array:`, item);
                    item.equipamiento = [];
                }
            });

            modelosData = data;
            console.log('Datos procesados:', modelosData);

            if (modelosData.length > 0) {
                console.log('Primer modelo:', modelosData[0]);
                console.log('Equipamiento del primer modelo:', modelosData[0].equipamiento);
                console.log('Número de items de equipamiento:', modelosData[0].equipamiento.length);
            }

            inicializarFiltros();
        })
        .catch(error => {
            console.error('Error al cargar los datos:', error);
            mostrarError('No se pudieron cargar los datos. Por favor recarga la página. Error: ' + error.message);
        });

    // Inicializar los filtros
    function inicializarFiltros() {
        // Obtener modelos únicos
        const modelos = [...new Set(modelosData.map(item => item.modelo))].filter(Boolean);
        console.log('Modelos encontrados:', modelos);

        // Llenar filtros de modelo
        modelos.forEach(modelo => {
            const optionA = document.createElement('option');
            optionA.value = modelo;
            optionA.textContent = modelo;
            selectModeloA.appendChild(optionA.cloneNode(true));

            const optionB = document.createElement('option');
            optionB.value = modelo;
            optionB.textContent = modelo;
            selectModeloB.appendChild(optionB);
        });

        // Configurar event listeners
        selectModeloA.addEventListener('change', () => actualizarFiltrosVersion('A'));
        selectVersionA.addEventListener('change', () => actualizarSeleccionModelo('A'));
        selectModeloB.addEventListener('change', () => actualizarFiltrosVersion('B'));
        selectVersionB.addEventListener('change', () => actualizarSeleccionModelo('B'));
        selectCategoria.addEventListener('change', actualizarComparacion);
        resetBtn.addEventListener('click', reiniciarComparacion);

        mostrarEstadoInicial();
    }

    // Actualizar filtros de versión
    function actualizarFiltrosVersion(lado) {
        const selectModelo = document.getElementById(`modelo${lado}`);
        const selectVersion = document.getElementById(`version${lado}`);

        selectVersion.innerHTML = '<option value="">-- Todas las versiones --</option>';

        const modeloSeleccionado = selectModelo.value;
        if (!modeloSeleccionado) return;

        const versiones = [...new Set(modelosData
            .filter(item => item.modelo === modeloSeleccionado)
            .map(item => item.version))].filter(Boolean);

        versiones.forEach(version => {
            const option = document.createElement('option');
            option.value = version;
            option.textContent = version;
            selectVersion.appendChild(option);
        });
    }

    // Actualizar selección de modelo
    function actualizarSeleccionModelo(lado) {
        const selectModelo = document.getElementById(`modelo${lado}`);
        const selectVersion = document.getElementById(`version${lado}`);

        const modelo = selectModelo.value;
        const version = selectVersion.value;

        if (modelo && version) {
            const modeloCompleto = modelosData.find(item =>
                item.modelo === modelo && item.version === version
            );

            if (modeloCompleto) {
                if (lado === 'A') {
                    modeloSeleccionadoA = modeloCompleto;
                } else {
                    modeloSeleccionadoB = modeloCompleto;
                }
                console.log(`Modelo ${lado} seleccionado:`, modeloCompleto);
                console.log(`Equipamiento del modelo ${lado}:`, modeloCompleto.equipamiento);
                actualizarComparacion();
            }
        } else {
            // Limpiar selección si no hay versión
            if (lado === 'A') {
                modeloSeleccionadoA = null;
            } else {
                modeloSeleccionadoB = null;
            }
            actualizarComparacion();
        }
    }

    // Función principal para actualizar la comparación
    function actualizarComparacion() {
        console.log('Actualizando comparación...');
        console.log('Modelo A:', modeloSeleccionadoA);
        console.log('Modelo B:', modeloSeleccionadoB);

        // Validar selección
        if (!modeloSeleccionadoA || !modeloSeleccionadoB) {
            if (!modeloSeleccionadoA && !modeloSeleccionadoB) {
                mostrarEstadoInicial();
            } else {
                mostrarEstadoParcial();
            }
            return;
        }

        const categoriaSeleccionada = selectCategoria.value;

        // Actualizar headers
        modeloAHeader.textContent = `${modeloSeleccionadoA.modelo} ${modeloSeleccionadoA.version}`;
        modeloBHeader.textContent = `${modeloSeleccionadoB.modelo} ${modeloSeleccionadoB.version}`;

        // Generar comparación
        const comparacion = generarComparacion(modeloSeleccionadoA, modeloSeleccionadoB, categoriaSeleccionada);
        mostrarResultados(comparacion);
    }

    // Generar array con los resultados de la comparación
    function generarComparacion(modeloA, modeloB, categoria) {
        // Verificar que los modelos tengan equipamiento
        if (!modeloA.equipamiento || !modeloB.equipamiento) {
            console.error('Modelos sin equipamiento:', modeloA, modeloB);
            return [];
        }

        const todosEquipamientos = new Set([
            ...modeloA.equipamiento.map(e => e.nombre),
            ...modeloB.equipamiento.map(e => e.nombre)
        ]);

        const equipamientosOrdenados = Array.from(todosEquipamientos).sort((a, b) => a.localeCompare(b));

        return equipamientosOrdenados.map(equipamiento => {
            const enModeloA = modeloA.equipamiento.find(e => e.nombre === equipamiento);
            const enModeloB = modeloB.equipamiento.find(e => e.nombre === equipamiento);

            const categoriaEquipamiento = enModeloA?.categoria || enModeloB?.categoria || 'Sin categoría';

            return {
                nombre: equipamiento,
                categoria: categoriaEquipamiento,
                modeloA: enModeloA?.incluido || false,
                modeloB: enModeloB?.incluido || false
            };
        }).filter(item => {
            return categoria === 'todas' || item.categoria === categoria;
        });
    }

    // Mostrar resultados en el DOM
    function mostrarResultados(comparacion) {
        resultsContainer.innerHTML = '';

        if (comparacion.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay equipamientos para mostrar con los filtros seleccionados</p>
                </div>
            `;
            return;
        }

        const mostrarCategorias = selectCategoria.value === 'todas';
        let categoriaActual = '';

        comparacion.forEach(item => {
            if (mostrarCategorias && item.categoria !== categoriaActual) {
                categoriaActual = item.categoria;
                const categoriaHeader = document.createElement('div');
                categoriaHeader.className = 'category-header';
                categoriaHeader.textContent = categoriaActual;
                resultsContainer.appendChild(categoriaHeader);
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'comparison-item';

            const claseModeloA = item.modeloA ? 'positive' : 'negative';
            const claseModeloB = item.modeloB ? 'positive' : 'negative';
            const iconoA = item.modeloA ? '✓' : '✗';
            const iconoB = item.modeloB ? '✓' : '✗';

            itemElement.innerHTML = `
                <div class="comparison-feature">${item.nombre}</div>
                <div class="comparison-value ${claseModeloA}">${iconoA}</div>
                <div class="comparison-value ${claseModeloB}">${iconoB}</div>
            `;

            resultsContainer.appendChild(itemElement);
        });
    }

    // Mostrar estado parcial (solo un modelo seleccionado)
    function mostrarEstadoParcial() {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <p>Selecciona ambos modelos para comparar</p>
            </div>
        `;
    }

    // Reiniciar la comparación
    function reiniciarComparacion() {
        selectModeloA.value = '';
        selectVersionA.value = '';
        selectModeloB.value = '';
        selectVersionB.value = '';
        selectCategoria.value = 'todas';
        modeloSeleccionadoA = null;
        modeloSeleccionadoB = null;
        modeloAHeader.textContent = 'Modelo A';
        modeloBHeader.textContent = 'Modelo B';
        mostrarEstadoInicial();
    }

    // Mostrar estado inicial
    function mostrarEstadoInicial() {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="Comparar" width="100">
                <p>Selecciona dos modelos para comenzar la comparación</p>
            </div>
        `;
    }

    // Mostrar mensaje de error
    function mostrarError(mensaje) {
        resultsContainer.innerHTML = `
            <div class="error-state">
                <p>${mensaje}</p>
            </div>
        `;
    }
}

// =======================================================================
// COMPARADOR DE PRECIOS
// =======================================================================
function initComparadorPrecios() {
    // Limpiar localStorage para evitar conflictos
    localStorage.removeItem('vehicles');

    // =======================================================================
    // DATOS DE VEHÍCULOS FIAT 
    // =======================================================================
    const fiatVehicles = [
        { id: 1001, brand: "Fiat", model: "Cronos", version: "Like 1.3 GSE MY26", price: 28519000 },
        { id: 1002, brand: "Fiat", model: "Cronos", version: "Drive 1.3 GSE PACK PLUS MY26", price: 34100000 },
        { id: 1003, brand: "Fiat", model: "Cronos", version: "Drive 1.3L GSE CVT PACK PLUS MY26", price: 34305000 },
        { id: 1004, brand: "Fiat", model: "Cronos", version: "Precision 1.3 GSE CVT MY26", price: 35546000 },
        { id: 1005, brand: "Fiat", model: "Pulse", version: "Drive 1.3 MT5", price: 34015000 },
        { id: 1006, brand: "Fiat", model: "Pulse", version: "Drive 1.3 CVT", price: 35224000 },
        { id: 1007, brand: "Fiat", model: "Pulse", version: "Audace 1.0T CVT", price: 38063000 },
        { id: 1008, brand: "Fiat", model: "Pulse", version: "Impetus 1.0T CVT", price: 39376000 },
        { id: 1009, brand: "Fiat", model: "Pulse", version: "Abarth Turbo 270 AT6", price: 41296000 },
        { id: 1010, brand: "Fiat", model: "Mobi", version: "Trekking 1.0", price: 24964000 },
        { id: 1011, brand: "Fiat", model: "Argo", version: "Drive 1.3L MT", price: 27898000 },
        { id: 1012, brand: "Fiat", model: "Fastback", version: "Turbo 270 AT", price: 42117000 },
        { id: 1013, brand: "Fiat", model: "Fastback", version: "Abarth Turbo 270 AT6", price: 45964000 },
        { id: 1015, brand: "Fiat", model: "Fiorino", version: "Endurance 1.3 FIREFLY", price: 27459000 },
        { id: 1016, brand: "Fiat", model: "Strada", version: "Freedom CS 1.3 MT", price: 30555000 },
        { id: 1017, brand: "Fiat", model: "Strada", version: "Freedom 1.3 8V CD", price: 34872000 },
        { id: 1018, brand: "Fiat", model: "Strada", version: "Volcano 1.3 8V CD CVT", price: 38946000 },
        { id: 1021, brand: "Fiat", model: "Toro", version: "Freedom T270 AT6 4X2", price: 43917000 },
        { id: 1022, brand: "Fiat", model: "Toro", version: "Volcano T270 AT6 4X2", price: 49073000 },
        { id: 1025, brand: "Fiat", model: "Titano", version: "Endurance MT 4X2", price: 46726000 },
        { id: 1026, brand: "Fiat", model: "Titano", version: "Endurance MT 4X4", price: 49454000 },
        { id: 1027, brand: "Fiat", model: "Titano", version: "Freedom MT 4X4", price: 54457000 },
        { id: 1028, brand: "Fiat", model: "Titano", version: "Freedom Plus AT 4X4", price: 59800000 },
        { id: 1029, brand: "Fiat", model: "Titano", version: "Ranch AT 4X4", price: 64575000 }
    ];

    // =======================================================================
    // DATOS DE VEHÍCULOS OTRAS MARCAS
    // =======================================================================
    const otherBrandsVehicles = [
        { id: 2002, brand: "Peugeot", model: "208", version: "Allure MT AM26", price: 33830000 },
        { id: 2003, brand: "Peugeot", model: "208", version: "Allure AT AM26", price: 35580000 },
        { id: 2004, brand: "Peugeot", model: "208", version: "Allure PK T200 AM26", price: 38220000 },
        { id: 2005, brand: "Peugeot", model: "208", version: "GT T200 AM26", price: 40290000 },
        { id: 2006, brand: "Peugeot", model: "2008", version: "Active T200 AM26", price: 41340000 },
        { id: 2007, brand: "Peugeot", model: "2008", version: "Allure T200 AM26", price: 45290000 },
        { id: 2008, brand: "Peugeot", model: "2008", version: "GT T200 AM26", price: 49450000 },
        { id: 2009, brand: "Peugeot", model: "Partner", version: "Confort 1.6 HDI AM22.5", price: 33050000 },
        { id: 2010, brand: "Peugeot", model: "Expert", version: "Expert L3 HDI 120 AM25", price: 50590000 },
        { id: 2011, brand: "Peugeot", model: "Expert", version: "Expert L3 HDI 150 AM26", price: 53830000 },
        { id: 2012, brand: "Peugeot", model: "Expert", version: "Expert L3 HDI 150 6P AM26", price: 58950000 },
        { id: 2013, brand: "Jeep", model: "Renegade", version: "Sport T270 1.3 AT6 FWD", price: 43856400 },
        { id: 2014, brand: "Jeep", model: "Renegade", version: "Longitude T270 AT6 FWD MY25", price: 48487200 },
        { id: 2015, brand: "Jeep", model: "Renegade", version: "S T270 1.3 AT6 MY25", price: 49576800 },
        { id: 2016, brand: "Jeep", model: "Renegade", version: "Willys T270 AT9 4X4", price: 54616200 },
        { id: 2017, brand: "Jeep", model: "Compass", version: "Sport T270 AT6 4X2 MY25", price: 52573200 },
        { id: 2018, brand: "Jeep", model: "Compass", version: "Limited Plus T270 AT6 4X2 MY25", price: 56795400 },
        { id: 2019, brand: "Jeep", model: "Compass", version: "S T270 AT6 FWD MY25", price: 57340200 },
        { id: 2020, brand: "Jeep", model: "Compass", version: "Blackhawk 2.0T GME AT9", price: 69462000 },
        { id: 2021, brand: "Jeep", model: "Commander", version: "Limited GSE 1.3T FWD AT6 BZ MY24", price: 65239800 },
        { id: 2022, brand: "Jeep", model: "Commander", version: "Overland 2.0L GME AT9 4X4", price: 79268400 },
        { id: 2023, brand: "Jeep", model: "Commander", version: "Blackhawk 2.0l GME AT9 4x4", price: 79949400 },
        { id: 2024, brand: "Ram", model: "Rampage", version: "Rebel 2.0L GME AT9 4X4", price: 64967400 },
        { id: 2025, brand: "Ram", model: "Rampage", version: "Laramie 2.0L GME AT9 4X4", price: 65512200 },
        { id: 2026, brand: "Ram", model: "Rampage", version: "R/T 2.0L GME AT9 4X4", price: 74092800 },
    ];

    // Función para cargar vehículos
    function loadVehicles() {
        // Combinar todos los vehículos
        const allVehicles = [...fiatVehicles, ...otherBrandsVehicles];

        // Guardar en localStorage
        localStorage.setItem('vehicles', JSON.stringify(allVehicles));

        console.log('Vehículos cargados:', allVehicles.length);
        return allVehicles;
    }

    // Cargar vehículos
    let vehicles = loadVehicles();

    // =======================================================================
    // ELEMENTOS DEL DOM
    // =======================================================================

    // Función segura para obtener elementos
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: #${id}`);
            return null;
        }
        return element;
    }

    // Obtener elementos
    const brandFilter = getElement('brand-filter');
    const modelFilter = getElement('model-filter');
    const vehiclesList = getElement('vehicles-list');
    const vehicle1Select = getElement('vehicle1');
    const vehicle2Select = getElement('vehicle2');
    const compareButton = getElement('compare-btn');
    const resetButton = getElement('reset-btn');
    const comparisonResult = getElement('comparison-result');
    const vehicle1Details = getElement('vehicle1-details');
    const vehicle2Details = getElement('vehicle2-details');
    const priceDifference = getElement('price-difference');
    const comparisonText = getElement('comparison-text');

    // Verificar que todos los elementos necesarios existan
    const requiredElements = [
        brandFilter, modelFilter, vehiclesList, vehicle1Select, vehicle2Select,
        compareButton, resetButton, comparisonResult, vehicle1Details,
        vehicle2Details, priceDifference, comparisonText
    ];

    if (requiredElements.some(element => !element)) {
        console.error('❌ Faltan elementos requeridos para la página de precios');
        return;
    }

    console.log('✅ Todos los elementos del DOM encontrados');

    // =======================================================================
    // FUNCIONALIDAD
    // =======================================================================

    // Cargar marcas en el filtro
    function loadBrandFilter() {
        const brands = [...new Set(vehicles.map(vehicle => vehicle.brand))];
        brandFilter.innerHTML = '<option value="">Todas las marcas</option>';

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Cargar modelos en el filtro
    function loadModelFilter() {
        const selectedBrand = brandFilter.value;
        let filteredVehicles = vehicles;

        if (selectedBrand) {
            filteredVehicles = vehicles.filter(vehicle => vehicle.brand === selectedBrand);
        }

        const models = [...new Set(filteredVehicles.map(vehicle => vehicle.model))];
        modelFilter.innerHTML = '<option value="">Todos los modelos</option>';

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelFilter.appendChild(option);
        });
    }

    // Cargar versiones en los selects de comparación
    function loadVersionSelects(brand = '', model = '') {
        let filteredVehicles = vehicles;

        if (brand) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.brand === brand);
        }

        if (model) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.model === model);
        }

        vehicle1Select.innerHTML = '<option value="">-- Seleccione una versión --</option>';
        vehicle2Select.innerHTML = '<option value="">-- Seleccione una versión --</option>';

        filteredVehicles.forEach(vehicle => {
            const option1 = document.createElement('option');
            option1.value = vehicle.id;
            option1.textContent = `${vehicle.brand} ${vehicle.model} ${vehicle.version} - $${vehicle.price.toLocaleString()}`;
            vehicle1Select.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = vehicle.id;
            option2.textContent = `${vehicle.brand} ${vehicle.model} ${vehicle.version} - $${vehicle.price.toLocaleString()}`;
            vehicle2Select.appendChild(option2);
        });
    }

    // Mostrar la lista de vehículos
    function renderVehicles() {
        vehiclesList.innerHTML = '';

        const selectedBrand = brandFilter.value;
        const selectedModel = modelFilter.value;
        let filteredVehicles = vehicles;

        if (selectedBrand) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.brand === selectedBrand);
        }

        if (selectedModel) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.model === model);
        }

        if (filteredVehicles.length === 0) {
            vehiclesList.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #777;">No hay vehículos para mostrar.</td></tr>';
            return;
        }

        filteredVehicles.forEach(vehicle => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vehicle.brand}</td>
                <td>${vehicle.model}</td>
                <td>${vehicle.version}</td>
                <td>$${vehicle.price.toLocaleString()}</td>
            `;
            vehiclesList.appendChild(row);
        });
    }

    // Event listeners
    brandFilter.addEventListener('change', function () {
        loadModelFilter();
        renderVehicles();
        loadVersionSelects(this.value, '');
    });

    modelFilter.addEventListener('change', function () {
        renderVehicles();
        loadVersionSelects(brandFilter.value, this.value);
    });

    compareButton.addEventListener('click', function () {
        const vehicle1Id = parseInt(vehicle1Select.value);
        const vehicle2Id = parseInt(vehicle2Select.value);

        if (!vehicle1Id || !vehicle2Id) {
            alert('Por favor, seleccione dos versiones para comparar.');
            return;
        }

        if (vehicle1Id === vehicle2Id) {
            alert('Por favor, seleccione dos versiones diferentes para comparar.');
            return;
        }

        const vehicle1 = vehicles.find(v => v.id === vehicle1Id);
        const vehicle2 = vehicles.find(v => v.id === vehicle2Id);

        const difference = vehicle1.price - vehicle2.price;

        vehicle1Details.textContent = `${vehicle1.brand} ${vehicle1.model} ${vehicle1.version}: $${vehicle1.price.toLocaleString()}`;
        vehicle2Details.textContent = `${vehicle2.brand} ${vehicle2.model} ${vehicle2.version}: $${vehicle2.price.toLocaleString()}`;

        if (difference > 0) {
            priceDifference.textContent = `Diferencia: +$${difference.toLocaleString()}`;
            priceDifference.className = 'price-difference positive';
            comparisonText.textContent = `El ${vehicle1.brand} ${vehicle1.model} ${vehicle1.version} es más caro que el ${vehicle2.brand} ${vehicle2.model} ${vehicle2.version}`;
        } else if (difference < 0) {
            priceDifference.textContent = `Diferencia: -$${Math.abs(difference).toLocaleString()}`;
            priceDifference.className = 'price-difference negative';
            comparisonText.textContent = `El ${vehicle1.brand} ${vehicle1.model} ${vehicle1.version} es más barato que el ${vehicle2.brand} ${vehicle2.model} ${vehicle2.version}`;
        } else {
            priceDifference.textContent = 'Mismo precio';
            priceDifference.className = 'price-difference';
            comparisonText.textContent = 'Ambas versiones tienen el mismo precio';
        }

        comparisonResult.style.display = 'block';
    });

    resetButton.addEventListener('click', function () {
        vehicle1Select.value = '';
        vehicle2Select.value = '';
        comparisonResult.style.display = 'none';
    });

    // Inicializar
    loadBrandFilter();
    loadModelFilter();
    loadVersionSelects('', '');
    renderVehicles();

    console.log('✅ Comparador de precios inicializado correctamente');
}

// =======================================================================
// DETECCIÓN MEJORADA DE PÁGINAS
// =======================================================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado - Iniciando aplicación');

    // Detectar páginas de forma más precisa
    const currentPath = window.location.pathname;
    const isIndexPage = currentPath.endsWith('index.html') || currentPath.endsWith('/');
    const isPreciosPage = currentPath.includes('precios.html');
    const isPautasPage = currentPath.includes('pautas.html');

    console.log('Página detectada:', {
        index: isIndexPage,
        precios: isPreciosPage,
        pautas: isPautasPage,
        path: currentPath
    });

    // Ejecutar código según el tipo de página
    if (isIndexPage) {
        console.log('✅ Inicializando comparador de equipamientos...');
        initComparadorEquipamientos();
    }

    if (isPreciosPage) {
        console.log('✅ Inicializando comparador de precios...');
        initComparadorPrecios();
    }

    if (isPautasPage) {
        console.log('✅ Inicializando página de modelos comerciales...');
        initFiatModelsPage();
    }
});

// =======================================================================
// PÁGINA DE MODELOS COMERCIALES (FIAT + PEUGEOT + JEEP) - MEJORADA
// =======================================================================
function initFiatModelsPage() {
    console.log('Inicializando página de modelos comerciales...');

    // Datos de los modelos con múltiples financiaciones
    const fiatModels = [
        {
            marca: "FIAT",
            modelo: "MOBI TREKKING 1.O",
            financiaciones: [
                {
                    tipo: "80/20",
                    cuotas: "84",
                    sobrepauta: "",
                    pea1: "6-9-12 / 40%",
                    pea2: "24-36 / 20%",
                    suscrNeutra: "$250.000",
                    suscrPremio: "$290.000",
                    bonificacion: "$350.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "ARGO DRIVE PACK PLUS",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 30%",
                    pea1: "4-6-9-12 / 35%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$285.000",
                    suscrPremio: "$325.000",
                    bonificacion: "$350.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "CRONOS DRIVE PACK PLUS",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 30%",
                    pea1: "4-6-9-12 / 35%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$315.000",
                    suscrPremio: "$355.000",
                    bonificacion: "$350.000",
                    retiro: "6% + DA (2.5%)"
                },
                {
                    tipo: "90/10",
                    cuotas: "84",
                    sobrepauta: "NOV 20%",
                    pea1: "10-24-36 / 10%",
                    pea2: "",
                    suscrNeutra: "$425.000",
                    suscrPremio: "$465.000",
                    bonificacion: "$350.000",
                    retiro: "6% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "PULSE DRIVE",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 35%",
                    pea1: "4-9-12 / 35%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$345.000",
                    suscrPremio: "$385.000",
                    bonificacion: "$500.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "FASTBACK TURBO 270",
            financiaciones: [
                {
                    tipo: "60/40",
                    cuotas: "84",
                    sobrepauta: "NOV 40%",
                    pea1: "4-9-12-24-36 / 40%",
                    pea2: "",
                    suscrNeutra: "$365.000",
                    suscrPremio: "$405.000",
                    bonificacion: "$500.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "FIORINO ENDURANCE",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "",
                    pea1: "4-9-12 / 40%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$290.000",
                    suscrPremio: "$330.000",
                    bonificacion: "$350.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "STRADA FREEDOM",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "",
                    pea1: "6-9-12 / 40%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$350.000",
                    suscrPremio: "$390.000",
                    bonificacion: "$500.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "TORO FREEDOM",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "",
                    pea1: "4-9-12 / 40%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$395.000",
                    suscrPremio: "$435.000",
                    bonificacion: "$700.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "FIAT",
            modelo: "TITANO ENDURANCE",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 30%",
                    pea1: "4-9-12 / 35%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$440.000",
                    suscrPremio: "$480.000",
                    bonificacion: "$700.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        }
    ];

    // Datos de los modelos Peugeot
    const peugeotModels = [
        {
            marca: "PEUGEOT",
            modelo: "208 ALLURE 1.6 AM26",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 20%",
                    pea1: "2-6-9-12 / 30%",
                    pea2: "",
                    suscrNeutra: "$320.000",
                    suscrPremio: "$360.000",
                    bonificacion: "$500.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                },
                {
                    tipo: "70/30",
                    cuotas: "120",
                    sobrepauta: "NOV 20%",
                    pea1: "2-12 / 30%",
                    pea2: "",
                    suscrNeutra: "$260.000",
                    suscrPremio: "$300.000",
                    bonificacion: "$350.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        },
        {
            marca: "PEUGEOT",
            modelo: "208 ALLURE AT AM26",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 20%",
                    pea1: "2-6-9-12 / 30%",
                    pea2: "",
                    suscrNeutra: "$340.000",
                    suscrPremio: "$380.000",
                    bonificacion: "$500.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        },
        {
            marca: "PEUGEOT",
            modelo: "2008 ACTIVE T200 AM26",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 30%",
                    pea1: "4-6 / 40%",
                    pea2: "9-12 / 30%",
                    suscrNeutra: "$360.000",
                    suscrPremio: "$400.000",
                    bonificacion: "$700.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        },
        {
            marca: "PEUGEOT",
            modelo: "2008 ALLURE T200 AM26",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 30%",
                    pea1: "2 / 40%",
                    pea2: "6-9 / 30%",
                    suscrNeutra: "$410.000",
                    suscrPremio: "$450.000",
                    bonificacion: "$700.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        },
        {
            marca: "PEUGEOT",
            modelo: "PARTNER CONFORT 1.6 HDI",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 20%",
                    pea1: "6-9-12 / 30%",
                    pea2: "",
                    suscrNeutra: "$300.000",
                    suscrPremio: "$340.000",
                    bonificacion: "$500.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        },
        {
            marca: "PEUGEOT",
            modelo: "EXPERT L3 HDI",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "NOV 35%",
                    pea1: "6-24-36 / 30%",
                    pea2: "",
                    suscrNeutra: "$470.000",
                    suscrPremio: "$510.000",
                    bonificacion: "$800.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        }
    ];

    // Datos de los modelos Jeep
    const jeepModels = [
        {
            marca: "JEEP",
            modelo: "RENEGADE SPORT",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 40%",
                    pea1: "4-9-12/40%",
                    pea2: "24-36/30%",
                    suscrNeutra: "$450.000",
                    suscrPremio: "$490.000",
                    bonificacion: "$1.700.000 si adjudica cuota 2 caso contrario $500.000 en GR",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "JEEP",
            modelo: "COMPASS SPORT 270 AT6",
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 50%",
                    pea1: "4-9-12/40%",
                    pea2: "24-36/30%",
                    suscrNeutra: "$510.000",
                    suscrPremio: "$550.000",
                    bonificacion: "$2.000.000 si adjudica cuota 2 caso contrario $700.000 en GR",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "JEEP",
            modelo: "RAM REBEL",
            financiaciones: [
                {
                    tipo: "60/40",
                    cuotas: "84",
                    sobrepauta: "NOV 50%",
                    pea1: "4-9-12-24-36 / 40%",
                    pea2: "",
                    suscrNeutra: "$540.000",
                    suscrPremio: "$580.000",
                    bonificacion: "$2.500.000 si adjudica cuota 2 caso contrario $700.000 en GR",
                    retiro: "6% + DA (2.5%)"
                }
            ]
        }
    ];

    // Combinar todos los modelos
    const allModels = [...fiatModels, ...peugeotModels, ...jeepModels];

    // Aplanar datos para la tabla (una fila por financiación)
    const tableData = [];
    allModels.forEach(model => {
        model.financiaciones.forEach(financiacion => {
            tableData.push({
                marca: model.marca,
                modelo: model.modelo,
                ...financiacion
            });
        });
    });

    // Función para cargar los datos en la tabla
    function loadTableData(models) {
        const tableBody = document.querySelector('#modelsTable tbody');
        tableBody.innerHTML = ''; // Limpiar tabla

        if (models.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="11" style="text-align: center; padding: 20px;">No se encontraron modelos con los filtros aplicados</td>`;
            tableBody.appendChild(row);
            return;
        }

        models.forEach(model => {
            const row = document.createElement('tr');

            // Destacar modelos con sobrepauta
            const tieneSobrepauta = model.sobrepauta && model.sobrepauta.trim() !== "";
            if (tieneSobrepauta) {
                row.classList.add('tiene-sobrepauta');
            }

            row.innerHTML = `
                <td class="fiat-model-name">${model.marca}</td>
                <td>${model.modelo}<br><small>Financiación: ${model.tipo}</small></td>
                <td>${model.financiacion || model.tipo}</td>
                <td>${model.cuotas}</td>
                <td class="${tieneSobrepauta ? 'sobrepauta-activa' : ''}">${model.sobrepauta || '-'}</td>
                <td>${model.pea1 || '-'}</td>
                <td>${model.pea2 || '-'}</td>
                <td>${model.suscrPremio}</td>
                <td>${model.suscrNeutra}</td>
                <td>${model.bonificacion}</td>
                <td>${model.retiro}</td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Función para filtrar los modelos
    function filterModels() {
        const modelFilter = document.getElementById('modelFilter').value.toLowerCase();
        const brandFilter = document.getElementById('brandFilter').value;
        const sobrepautaFilter = document.getElementById('sobrepautaFilter').value;

        const filteredModels = tableData.filter(model => {
            // Filtrar por modelo (nombre)
            const matchesModel = model.modelo.toLowerCase().includes(modelFilter) ||
                model.marca.toLowerCase().includes(modelFilter);

            // Filtrar por marca
            const matchesBrand = brandFilter === '' || model.marca.toLowerCase() === brandFilter.toLowerCase();

            // Filtrar por sobrepauta
            let matchesSobrepauta = true;
            if (sobrepautaFilter === 'con') {
                matchesSobrepauta = model.sobrepauta && model.sobrepauta.trim() !== "";
            } else if (sobrepautaFilter === 'sin') {
                matchesSobrepauta = !model.sobrepauta || model.sobrepauta.trim() === "";
            }

            return matchesModel && matchesBrand && matchesSobrepauta;
        });

        loadTableData(filteredModels);
    }

    // Cargar marcas en el filtro de marca
    function loadBrandFilter() {
        const brandFilter = document.getElementById('brandFilter');
        const brands = [...new Set(tableData.map(model => model.marca))];

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Configurar event listeners
    document.getElementById('modelFilter').addEventListener('input', filterModels);
    document.getElementById('brandFilter').addEventListener('change', filterModels);
    document.getElementById('sobrepautaFilter').addEventListener('change', filterModels);

    // Configurar botón de reinicio
    document.getElementById('resetFilters').addEventListener('click', function () {
        document.getElementById('modelFilter').value = '';
        document.getElementById('brandFilter').value = '';
        document.getElementById('sobrepautaFilter').value = 'todos';
        loadTableData(tableData);
    });

    // Inicializar
    loadBrandFilter();
    loadTableData(tableData);
    console.log('✅ Página de modelos comerciales inicializada correctamente');

    // Inicializar calculadora
    initCalculadoraIntegraciones(allModels);
}

// =======================================================================
// CALCULADORA DE INTEGRACIONES - CON FILTRO DE MARCA
// =======================================================================
function initCalculadoraIntegraciones(allModelsData) {
    console.log('Inicializando calculadora de integraciones...');

    // Datos de vehículos
    const fiatVehicles = [
        { id: 1002, brand: "Fiat", model: "Cronos", version: "Drive 1.3 GSE PACK PLUS MY26", price: 34100000 },
        { id: 1005, brand: "Fiat", model: "Pulse", version: "Drive 1.3 MT5", price: 34015000 },
        { id: 1010, brand: "Fiat", model: "Mobi", version: "Trekking 1.0", price: 24964000 },
        { id: 1011, brand: "Fiat", model: "Argo", version: "Drive 1.3L MT", price: 27898000 },
        { id: 1012, brand: "Fiat", model: "Fastback", version: "Turbo 270 AT", price: 42117000 },
        { id: 1015, brand: "Fiat", model: "Fiorino", version: "Endurance 1.3 FIREFLY", price: 27459000 },
        { id: 1017, brand: "Fiat", model: "Strada", version: "Freedom 1.3 8V CD", price: 34872000 },
        { id: 1021, brand: "Fiat", model: "Toro", version: "Freedom T270 AT6 4X2", price: 43917000 },
        { id: 1026, brand: "Fiat", model: "Titano", version: "Endurance MT 4X4", price: 49454000 },
    ];

    const otherBrandsVehicles = [
        { id: 2002, brand: "Peugeot", model: "208", version: "Allure MT AM26", price: 33830000 },
        { id: 2003, brand: "Peugeot", model: "208", version: "Allure AT AM26", price: 35580000 },
        { id: 2006, brand: "Peugeot", model: "2008", version: "Active T200 AM26", price: 41340000 },
        { id: 2007, brand: "Peugeot", model: "2008", version: "Allure T200 AM26", price: 45290000 },
        { id: 2009, brand: "Peugeot", model: "Partner", version: "Confort 1.6 HDI AM22.5", price: 33050000 },
        { id: 2010, brand: "Peugeot", model: "Expert", version: "Expert L3 HDI 120 AM25", price: 50590000 },
        { id: 2013, brand: "Jeep", model: "Renegade", version: "Sport T270 1.3 AT6 FWD", price: 43856400 },
        { id: 2017, brand: "Jeep", model: "Compass", version: "Sport T270 AT6 4X2 MY25", price: 52573200 },
        { id: 2024, brand: "Ram", model: "Rampage", version: "Rebel 2.0L GME AT9 4X4", price: 64967400 },
    ];

    // Combinar todos los vehículos
    const allVehicles = [...fiatVehicles, ...otherBrandsVehicles];
    
    // Elementos del DOM
    const marcaCalculadora = document.getElementById('marcaCalculadora');
    const vehicleSelect = document.getElementById('vehicleSelect');
    const financiacionSelect = document.getElementById('financiacionSelect');
    const precioVehiculo = document.getElementById('precioVehiculo');
    const tipoAdjudicacion = document.getElementById('tipoAdjudicacion');
    const cuotaAdjudicar = document.getElementById('cuotaAdjudicar');
    const calcularBtn = document.getElementById('calcularBtn');

    // Elementos de resultados
    const resultPrecio = document.getElementById('resultPrecio');
    const resultPorcentaje = document.getElementById('resultPorcentaje');
    const resultTotal = document.getElementById('resultTotal');
    const resultSuscripcion = document.getElementById('resultSuscripcion');
    const resultFinal = document.getElementById('resultFinal');

    // Verificar que los elementos existan
    if (!vehicleSelect || !calcularBtn) {
        console.warn('Calculadora no encontrada en el DOM');
        return;
    }

    let currentModelInfo = null;

    // Cargar marcas en el filtro
    function loadMarcasInCalculator() {
        if (!marcaCalculadora) {
            console.warn('Filtro de marca no encontrado en el DOM');
            return;
        }
        
        marcaCalculadora.innerHTML = '<option value="">Todas las marcas</option>';
        const marcas = [...new Set(allVehicles.map(vehicle => vehicle.brand))].sort();
        
        marcas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca;
            option.textContent = marca;
            marcaCalculadora.appendChild(option);
        });
    }

    // Cargar vehículos en el select (filtrados por marca)
    function loadVehiclesInCalculator(marcaFiltro = '') {
        vehicleSelect.innerHTML = '<option value="">-- Seleccione un vehículo --</option>';
        
        // Filtrar vehículos por marca si se seleccionó una
        const vehiclesToShow = marcaFiltro 
            ? allVehicles.filter(vehicle => vehicle.brand === marcaFiltro)
            : allVehicles;
        
        // Ordenar por marca y modelo
        vehiclesToShow.sort((a, b) => {
            if (a.brand !== b.brand) {
                return a.brand.localeCompare(b.brand);
            }
            return a.model.localeCompare(b.model);
        });

        vehiclesToShow.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.brand} ${vehicle.model} ${vehicle.version} - $${vehicle.price.toLocaleString()}`;
            option.setAttribute('data-price', vehicle.price);
            option.setAttribute('data-brand', vehicle.brand);
            option.setAttribute('data-model', vehicle.model);
            vehicleSelect.appendChild(option);
        });

        // Limpiar campos dependientes cuando se cambia la marca
        precioVehiculo.value = '';
        if (financiacionSelect) {
            financiacionSelect.innerHTML = '<option value="">-- Seleccione financiación --</option>';
        }
        currentModelInfo = null;
    }

    // Cargar financiaciones cuando se selecciona un vehículo
    function loadFinanciaciones(vehicleBrand, vehicleModel) {
        if (!financiacionSelect) return;
        
        financiacionSelect.innerHTML = '<option value="">-- Seleccione financiación --</option>';
        currentModelInfo = null;
        
        const modelInfo = findModelInfo(vehicleBrand, vehicleModel);
        if (!modelInfo || !modelInfo.financiaciones) {
            console.warn('No se encontraron financiaciones para:', vehicleBrand, vehicleModel);
            return;
        }
        
        currentModelInfo = modelInfo;
        
        modelInfo.financiaciones.forEach((financiacion, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${financiacion.tipo} - ${financiacion.cuotas} cuotas`;
            financiacionSelect.appendChild(option);
        });
    }

    // Cuando se cambia la marca en el filtro
    if (marcaCalculadora) {
        marcaCalculadora.addEventListener('change', function() {
            const marcaSeleccionada = this.value;
            loadVehiclesInCalculator(marcaSeleccionada);
        });
    }

    // Cuando se selecciona un vehículo
    vehicleSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            const price = selectedOption.getAttribute('data-price');
            const brand = selectedOption.getAttribute('data-brand');
            const model = selectedOption.getAttribute('data-model');
            
            precioVehiculo.value = `$${parseInt(price).toLocaleString()}`;
            loadFinanciaciones(brand, model);
        } else {
            precioVehiculo.value = '';
            if (financiacionSelect) {
                financiacionSelect.innerHTML = '<option value="">-- Seleccione financiación --</option>';
            }
            currentModelInfo = null;
        }
    });

    // Función para calcular la integración
    function calcularIntegracion() {
        const vehicleId = parseInt(vehicleSelect.value);
        const selectedTipo = tipoAdjudicacion.value;
        const selectedCuota = parseInt(cuotaAdjudicar.value);
        const selectedFinanciacionIndex = financiacionSelect ? parseInt(financiacionSelect.value) : 0;

        if (!vehicleId) {
            alert('Por favor, seleccione un vehículo.');
            return;
        }

        if (financiacionSelect && isNaN(selectedFinanciacionIndex)) {
            alert('Por favor, seleccione un tipo de financiación.');
            return;
        }

        try {
            // Obtener datos del vehículo
            const vehicle = allVehicles.find(v => v.id === vehicleId);
            if (!vehicle) {
                alert('Vehículo no encontrado.');
                return;
            }

            const vehiclePrice = vehicle.price;
            const vehicleBrand = vehicle.brand;
            const vehicleModel = vehicle.model;

            // Buscar información de pautas para este modelo
            let modelInfo = currentModelInfo;
            if (!modelInfo) {
                modelInfo = findModelInfo(vehicleBrand, vehicleModel);
            }
            
            if (!modelInfo) {
                alert('No se encontró información de pautas comerciales para este modelo.');
                return;
            }

            // Obtener la financiación seleccionada
            const financiacion = modelInfo.financiaciones[selectedFinanciacionIndex];
            if (!financiacion) {
                alert('No se encontró la financiación seleccionada.');
                return;
            }

            // Calcular porcentaje según tipo de adjudicación y cuota
            const porcentaje = calcularPorcentaje(selectedTipo, selectedCuota, financiacion);
            
            // Validar porcentaje
            if (porcentaje === 0) {
                alert('No se pudo determinar el porcentaje para la combinación seleccionada.');
                return;
            }
            
            // Calcular montos
            const totalIntegrar = Math.round(vehiclePrice * (porcentaje / 100));
            const suscripcion = calcularSuscripcion(financiacion);
            const bonificacion = calcularBonificacion(financiacion, selectedCuota);
            const integracionFinal = totalIntegrar + suscripcion - bonificacion;

            // Mostrar resultados
            mostrarResultados(vehiclePrice, porcentaje, totalIntegrar, suscripcion, bonificacion, integracionFinal);
            
        } catch (error) {
            console.error('Error en el cálculo:', error);
            alert('Ocurrió un error en el cálculo. Por favor, verifique los datos.');
        }
    }

    // Buscar información del modelo en las pautas
    function findModelInfo(brand, model) {
        // Normalizar búsqueda para hacerla más flexible
        const normalizedBrand = brand.toLowerCase().trim();
        const normalizedModel = model.toLowerCase().trim();
        
        // Buscar en todos los modelos
        for (const modelData of allModelsData) {
            const modelBrand = modelData.marca.toLowerCase().trim();
            const modelName = modelData.modelo.toLowerCase().trim();
            
            // Buscar coincidencias flexibles
            const brandMatch = modelBrand.includes(normalizedBrand) || normalizedBrand.includes(modelBrand);
            const modelMatch = modelName.includes(normalizedModel) || normalizedModel.includes(modelName);
            
            if (brandMatch && modelMatch) {
                return modelData;
            }
        }
        return null;
    }

    // Calcular porcentaje según tipo y cuota
    function calcularPorcentaje(tipo, cuota, financiacion) {
        switch(tipo) {
            case 'sobrepauta':
                return parseSobrepauta(financiacion.sobrepauta);
            
            case 'pea1':
                return parsePEA(financiacion.pea1, cuota);
            
            case 'pea2':
                return parsePEA(financiacion.pea2, cuota);
            
            default:
                return 0;
        }
    }

    // Parsear porcentaje de sobrepauta - CORREGIDO
    function parseSobrepauta(sobrepauta) {
        if (!sobrepauta || sobrepauta === '-' || sobrepauta.trim() === '') return 0;
        
        // Buscar patrones como "NOV 30%" o simplemente "30%"
        const match = sobrepauta.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
    }

    // Parsear porcentaje de PEA - MEJORADO
    function parsePEA(pea, cuota) {
        if (!pea || pea === '-' || pea.trim() === '') return 0;
        
        console.log(`Buscando cuota ${cuota} en:`, pea);
        
        // Buscar el porcentaje para la cuota específica
        // Patrones: "2-6-9-12 / 30%" o "4-9-12/40%" o "2 / 40%"
        const cuotaPattern = new RegExp(`(^|\\s|-)${cuota}(\\s*\\/|\\s*-|\\s|$).*?(\\d+)%`, 'i');
        const match = pea.match(cuotaPattern);
        
        if (match) {
            const porcentaje = parseInt(match[3]);
            console.log(`Encontrado porcentaje ${porcentaje}% para cuota ${cuota}`);
            return porcentaje;
        }
        
        // Si no encuentra la cuota específica, buscar el primer porcentaje disponible
        const generalMatch = pea.match(/(\d+)%/);
        if (generalMatch) {
            const porcentaje = parseInt(generalMatch[1]);
            console.log(`Usando porcentaje general ${porcentaje}% para cuota ${cuota}`);
            return porcentaje;
        }
        
        console.log(`No se encontró porcentaje para cuota ${cuota}`);
        return 0;
    }

    // Calcular suscripción - CORREGIDO
    function calcularSuscripcion(financiacion) {
        const suscrText = financiacion.suscrPremio || financiacion.suscrNeutra || '$0';
        console.log('Texto de suscripción:', suscrText);
        
        // Extraer el número (puede ser "290.000" o "290000")
        const match = suscrText.match(/\$?([\d.,]+)/);
        if (match) {
            let amountStr = match[1];
            // Remover puntos de miles y convertir coma decimal a punto
            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
            const amount = parseFloat(amountStr);
            console.log('Suscripción calculada:', amount);
            return amount;
        }
        return 0;
    }

    // Calcular bonificación - CORREGIDO
    function calcularBonificacion(financiacion, cuota) {
        const bonifText = financiacion.bonificacion || '$0';
        console.log('Texto de bonificación:', bonifText);
        
        // Verificar si aplica bonificación por adjudicar cuota 2
        if (cuota === 2 && bonifText.includes('adjudica cuota 2')) {
            const match = bonifText.match(/\$?([\d.,]+)\s*si adjudica cuota 2/);
            if (match) {
                let amountStr = match[1];
                amountStr = amountStr.replace(/\./g, '').replace(',', '.');
                const amount = parseFloat(amountStr);
                console.log('Bonificación por cuota 2:', amount);
                return amount;
            }
        }
        
        // Bonificación general (sin condición de cuota)
        const generalMatch = bonifText.match(/\$?([\d.,]+)/);
        if (generalMatch && !bonifText.includes('adjudica cuota 2')) {
            let amountStr = generalMatch[1];
            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
            const amount = parseFloat(amountStr);
            console.log('Bonificación general:', amount);
            return amount;
        }
        
        return 0;
    }

    // Mostrar resultados - CORREGIDO
    function mostrarResultados(precio, porcentaje, total, suscripcion, bonificacion, final) {
        resultPrecio.textContent = `$${precio.toLocaleString()}`;
        resultPorcentaje.textContent = `${porcentaje}%`;
        resultTotal.textContent = `$${total.toLocaleString()}`;
        resultSuscripcion.textContent = `$${suscripcion.toLocaleString()}`;
        resultFinal.textContent = `$${final.toLocaleString()}`;
        
        console.log('Resultados finales:', {
            precio,
            porcentaje,
            total,
            suscripcion,
            bonificacion,
            final
        });
    }

    // Event listener para el botón calcular
    calcularBtn.addEventListener('click', calcularIntegracion);

    // Inicializar
    loadMarcasInCalculator();
    loadVehiclesInCalculator();
    
    console.log('✅ Calculadora de integraciones con filtro de marca inicializada correctamente');
}