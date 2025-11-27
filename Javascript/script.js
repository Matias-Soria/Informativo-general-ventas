// =======================================================================
// MENÚ HAMBURGUESA - VERSIÓN MEJORADA
// =======================================================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando menú hamburguesa...');

    const menuToggle = document.querySelector('.menu-toggle');
    const navbarMenu = document.querySelector('.navbar ul');

    if (menuToggle && navbarMenu) {
        console.log('✅ Elementos del menú encontrados');

        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('📱 Menú hamburguesa clickeado');
            navbarMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.navbar') && !event.target.closest('.menu-toggle')) {
                navbarMenu.classList.remove('active');
            }
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbarMenu.classList.remove('active');
            });
        });
    } else {
        console.warn('❌ Elementos del menú no encontrados');
    }
});

// =======================================================================
// DEBUG - CONFIRMAR VERSIÓN NUEVA
// =======================================================================
console.log('✅ VERSIÓN NUEVA DEL SCRIPT CARGADA - ' + new Date().toLocaleTimeString());
console.log('🚀 Calculadora de integraciones MEJORADA cargada');

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
// COMPARADOR DE PRECIOS - VERSIÓN CORREGIDA
// =======================================================================
function initComparadorPrecios() {
    console.log('🔄 Inicializando comparador de precios...');

    // =======================================================================
    // DATOS DE VEHÍCULOS 
    // =======================================================================
    const vehiclesData = [
        // FIAT
        { id: 1001, brand: "Fiat", model: "Mobi", version: "Trekking 1.0", price: 26613000 },
        { id: 1002, brand: "Fiat", model: "Argo", version: "Drive 1.3L MT", price: 29293000 },
        { id: 1003, brand: "Fiat", model: "Cronos", version: "Like 1.3 GSE MY26", price: 29945000 },
        { id: 1004, brand: "Fiat", model: "Cronos", version: "Drive 1.3 GSE PACK PLUS MY26", price: 35805000 },
        { id: 1005, brand: "Fiat", model: "Cronos", version: "Drive 1.3L GSE CVT PACK PLUS MY26", price: 36021000 },
        { id: 1006, brand: "Fiat", model: "Cronos", version: "Precision 1.3 GSE CVT MY26", price: 37324000 },
        { id: 1007, brand: "Fiat", model: "Pulse", version: "Drive 1.3 MT5", price: 35716000 },
        { id: 1008, brand: "Fiat", model: "Pulse", version: "Drive 1.3 CVT", price: 36986000 },
        { id: 1009, brand: "Fiat", model: "Pulse", version: "Audace 1.0T CVT", price: 39967000 },
        { id: 1010, brand: "Fiat", model: "Pulse", version: "Impetus 1.0T CVT", price: 41345000 },
        { id: 1011, brand: "Fiat", model: "Pulse", version: "Abarth Turbo 270 AT6", price: 43361000 },
        { id: 1012, brand: "Fiat", model: "Fastback", version: "Turbo 270 AT", price: 44223000 },
        { id: 1013, brand: "Fiat", model: "Fastback", version: "Abarth Turbo 270 AT6", price: 48263000 },
        { id: 1014, brand: "Fiat", model: "Fiorino", version: "Endurance 1.3 FIREFLY", price: 28832000 },
        { id: 1015, brand: "Fiat", model: "Strada", version: "Freedom CS 1.3 MT", price: 32083000 },
        { id: 1016, brand: "Fiat", model: "Strada", version: "Freedom 1.3 8V CD", price: 36616000 },
        { id: 1017, brand: "Fiat", model: "Strada", version: "Volcano 1.3 8V CD CVT", price: 40894000 },
        { id: 1018, brand: "Fiat", model: "Toro", version: "Freedom T270 AT6 4X2", price: 46113000},
        { id: 1019, brand: "Fiat", model: "Toro", version: "Volcano T270 AT6 4X2", price: 51527000 },
        { id: 1020, brand: "Fiat", model: "Titano", version: "Endurance MT 4X2", price: 49063000 },
        { id: 1021, brand: "Fiat", model: "Titano", version: "Endurance MT 4X4", price: 51927000 },
        { id: 1022, brand: "Fiat", model: "Titano", version: "Freedom MT 4X4", price: 57180000 },
        { id: 1023, brand: "Fiat", model: "Titano", version: "Freedom Plus AT 4X4", price: 62790000 },
        { id: 1024, brand: "Fiat", model: "Titano", version: "Ranch AT 4X4", price: 67804000 },

        // PEUGEOT
        { id: 2002, brand: "Peugeot", model: "208", version: "Allure MT AM26", price: 35530000 },
        { id: 2003, brand: "Peugeot", model: "208", version: "Allure AT AM26", price: 37360000 },
        { id: 2004, brand: "Peugeot", model: "208", version: "Allure PK T200 AM26", price: 40140000 },
        { id: 2005, brand: "Peugeot", model: "208", version: "GT T200 AM26", price: 42310000 },
        { id: 2006, brand: "Peugeot", model: "2008", version: "Active T200 AM26", price: 43410000 },
        { id: 2007, brand: "Peugeot", model: "2008", version: "Allure T200 AM26", price: 47560000 },
        { id: 2008, brand: "Peugeot", model: "2008", version: "GT T200 AM26", price: 51930000 },
        { id: 2009, brand: "Peugeot", model: "Partner", version: "Confort 1.6 HDI AM22.5", price: 35700000 },
        { id: 2010, brand: "Peugeot", model: "Expert", version: "Expert L3 HDI 150 AM26", price: 56530000 },
        { id: 2011, brand: "Peugeot", model: "Expert", version: "Expert L3 HDI 150 6P AM26", price: 61900000 },

        // JEEP
        { id: 2012, brand: "Jeep", model: "Renegade", version: "Sport T270 1.3 AT6 FWD", price: 46046000 },
        { id: 2013, brand: "Jeep", model: "Renegade", version: "Longitude T270 AT6 FWD MY25", price: 50908000 },
        { id: 2014, brand: "Jeep", model: "Renegade", version: "S T270 1.3 AT6 MY25", price: 52052000 },
        { id: 2015, brand: "Jeep", model: "Renegade", version: "Willys T270 AT9 4X4", price: 57343000 },
        { id: 2016, brand: "Jeep", model: "Compass", version: "Sport T270 AT6 4X2 MY25", price: 55198000 },
        { id: 2017, brand: "Jeep", model: "Compass", version: "Limited Plus T270 AT6 4X2 MY25", price: 59631000 },
        { id: 2018, brand: "Jeep", model: "Compass", version: "S T270 AT6 FWD MY25", price: 60203000 },
        { id: 2019, brand: "Jeep", model: "Compass", version: "Blackhawk 2.0T GME AT9", price: 72930000 },
        { id: 2020, brand: "Jeep", model: "Commander", version: "Limited GSE 1.3T FWD AT6 BZ MY24", price: 68497000 },
        { id: 2021, brand: "Jeep", model: "Commander", version: "Overland 2.0L GME AT9 4X4", price: 83226000 },
        { id: 2022, brand: "Jeep", model: "Commander", version: "Blackhawk 2.0l GME AT9 4x4", price: 83941000 },

        // RAM
        { id: 2023, brand: "Ram", model: "Rampage", version: "Rebel 2.0L GME AT9 4X4", price: 68210000 },
        { id: 2024, brand: "Ram", model: "Rampage", version: "Laramie 2.0L GME AT9 4X4", price: 68783000 },
        { id: 2025, brand: "Ram", model: "Rampage", version: "R/T 2.0L GME AT9 4X4", price: 77792000 },
        { id: 2026, brand: "Ram", model: "Dakota", version: "Warlock 2.2 Turbo 4X4", price: 69000000 },
        { id: 2027, brand: "Ram", model: "Dakota", version: "Laramie 2.2 Turbo 4X4", price: 71000000 }
    ];

    // =======================================================================
    // ELEMENTOS DEL DOM - CON VERIFICACIÓN
    // =======================================================================
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: #${id}`);
            return null;
        }
        return element;
    }

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

    // Verificar elementos críticos
    if (!brandFilter || !vehiclesList) {
        console.error('❌ Elementos críticos no encontrados para la página de precios');
        return;
    }

    console.log('✅ Elementos del DOM cargados correctamente');

    // =======================================================================
    // FUNCIONALIDAD PRINCIPAL
    // =======================================================================
    let vehicles = vehiclesData;

    // Cargar marcas en el filtro
    function loadBrandFilter() {
        const brands = [...new Set(vehicles.map(vehicle => vehicle.brand))].sort();
        brandFilter.innerHTML = '<option value="">Todas las marcas</option>';

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // Cargar modelos en el filtro - CORREGIDO
    function loadModelFilter() {
        const selectedBrand = brandFilter.value;
        let filteredVehicles = vehicles;

        if (selectedBrand) {
            filteredVehicles = vehicles.filter(vehicle => vehicle.brand === selectedBrand);
        }

        const models = [...new Set(filteredVehicles.map(vehicle => vehicle.model))].sort();
        modelFilter.innerHTML = '<option value="">Todos los modelos</option>';

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelFilter.appendChild(option);
        });

        // Actualizar la tabla
        renderVehicles();
    }

    // Mostrar vehículos en la tabla - CORREGIDO
    function renderVehicles() {
        vehiclesList.innerHTML = '';

        const selectedBrand = brandFilter.value;
        const selectedModel = modelFilter.value;

        let filteredVehicles = vehicles;

        // Aplicar filtros
        if (selectedBrand) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.brand === selectedBrand);
        }

        if (selectedModel) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.model === selectedModel);
        }

        if (filteredVehicles.length === 0) {
            vehiclesList.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 30px; color: #777;">
                        No hay vehículos para mostrar con los filtros seleccionados
                    </td>
                </tr>
            `;
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

    // Cargar versiones en los selects de comparación
    function loadVersionSelects() {
        const selectedBrand = brandFilter.value;
        const selectedModel = modelFilter.value;

        let filteredVehicles = vehicles;

        if (selectedBrand) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.brand === selectedBrand);
        }

        if (selectedModel) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.model === selectedModel);
        }

        // Limpiar selects
        if (vehicle1Select) vehicle1Select.innerHTML = '<option value="">-- Seleccione una versión --</option>';
        if (vehicle2Select) vehicle2Select.innerHTML = '<option value="">-- Seleccione una versión --</option>';

        filteredVehicles.forEach(vehicle => {
            if (vehicle1Select) {
                const option1 = document.createElement('option');
                option1.value = vehicle.id;
                option1.textContent = `${vehicle.brand} ${vehicle.model} ${vehicle.version} - $${vehicle.price.toLocaleString()}`;
                vehicle1Select.appendChild(option1);
            }

            if (vehicle2Select) {
                const option2 = document.createElement('option');
                option2.value = vehicle.id;
                option2.textContent = `${vehicle.brand} ${vehicle.model} ${vehicle.version} - $${vehicle.price.toLocaleString()}`;
                vehicle2Select.appendChild(option2);
            }
        });
    }

    // Comparar vehículos
    function compareVehicles() {
        if (!vehicle1Select || !vehicle2Select) return;

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

        if (!vehicle1 || !vehicle2) {
            alert('Error: No se encontraron los vehículos seleccionados.');
            return;
        }

        const difference = vehicle1.price - vehicle2.price;

        // Mostrar detalles
        if (vehicle1Details) vehicle1Details.textContent = `${vehicle1.brand} ${vehicle1.model} ${vehicle1.version}: $${vehicle1.price.toLocaleString()}`;
        if (vehicle2Details) vehicle2Details.textContent = `${vehicle2.brand} ${vehicle2.model} ${vehicle2.version}: $${vehicle2.price.toLocaleString()}`;

        // Mostrar diferencia
        if (priceDifference) {
            if (difference > 0) {
                priceDifference.textContent = `Diferencia: +$${difference.toLocaleString()}`;
                priceDifference.className = 'price-difference positive';
                if (comparisonText) comparisonText.textContent = `El ${vehicle1.brand} ${vehicle1.model} ${vehicle1.version} es más caro que el ${vehicle2.brand} ${vehicle2.model} ${vehicle2.version}`;
            } else if (difference < 0) {
                priceDifference.textContent = `Diferencia: -$${Math.abs(difference).toLocaleString()}`;
                priceDifference.className = 'price-difference negative';
                if (comparisonText) comparisonText.textContent = `El ${vehicle1.brand} ${vehicle1.model} ${vehicle1.version} es más barato que el ${vehicle2.brand} ${vehicle2.model} ${vehicle2.version}`;
            } else {
                priceDifference.textContent = 'Mismo precio';
                priceDifference.className = 'price-difference';
                if (comparisonText) comparisonText.textContent = 'Ambas versiones tienen el mismo precio';
            }
        }

        // Mostrar resultado
        if (comparisonResult) comparisonResult.style.display = 'block';
    }

    // Reiniciar comparación
    function resetComparison() {
        if (vehicle1Select) vehicle1Select.value = '';
        if (vehicle2Select) vehicle2Select.value = '';
        if (comparisonResult) comparisonResult.style.display = 'none';
    }

    // =======================================================================
    // EVENT LISTENERS
    // =======================================================================
    brandFilter.addEventListener('change', function () {
        loadModelFilter();
        loadVersionSelects();
    });

    modelFilter.addEventListener('change', function () {
        renderVehicles();
        loadVersionSelects();
    });

    if (compareButton) {
        compareButton.addEventListener('click', compareVehicles);
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetComparison);
    }

    // =======================================================================
    // INICIALIZACIÓN
    // =======================================================================
    loadBrandFilter();
    loadModelFilter();
    loadVersionSelects();
    renderVehicles();

    console.log('✅ Comparador de precios inicializado correctamente');
}

// =======================================================================
// PÁGINA DE PAUTAS COMERCIALES - VERSIÓN COMPLETA Y FUNCIONAL
// =======================================================================
function initFiatModelsPage() {
    console.log('🔄 Inicializando página de pautas comerciales...');

    // =======================================================================
    // DATOS COMPLETOS DE PAUTAS CON PRECIOS
    // =======================================================================
    const allModelsData = [
        // FIAT
        {
            marca: "FIAT",
            modelo: "MOBI TREKKING 1.0",
            precio: 26213000,
            financiaciones: [
                {
                    tipo: "80/20",
                    cuotas: "84",
                    sobrepauta: "",
                    pea1: "6-9-12 / 30%",
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
            precio: 29293000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 30%",
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
            precio: 35805000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 30%",
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
                    sobrepauta: "DIC 20%",
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
            precio: 35716000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 35%",
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
            precio: 44223000,
            financiaciones: [
                {
                    tipo: "60/40",
                    cuotas: "84",
                    sobrepauta: "DIC 40%",
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
            precio: 28832000,
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
            precio: 36616000,
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
            precio: 46113000,
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
            precio: 51927000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 30%",
                    pea1: "4-9-12 / 35%",
                    pea2: "24-36 / 30%",
                    suscrNeutra: "$440.000",
                    suscrPremio: "$480.000",
                    bonificacion: "$700.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },

        // PEUGEOT
        {
            marca: "PEUGEOT",
            modelo: "208 ALLURE 1.6 AM26",
            precio: 35530000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 20%",
                    pea1: "2-6-9-12 / 30%",
                    pea2: "",
                    suscrNeutra: "$320.000",
                    suscrPremio: "$360.000",
                    bonificacion: "$500.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        },
        {
            marca: "PEUGEOT",
            modelo: "208 ALLURE AT AM26",
            precio: 37360000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 20%",
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
            precio: 43410000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 30%",
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
            precio: 47560000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 30%",
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
            precio: 35700000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 30%",
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
            modelo: "EXPERT L3 HDI 120 AM25",
            precio: 56530000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 30%",
                    pea1: "6-24-36 / 30%",
                    pea2: "",
                    suscrNeutra: "$470.000",
                    suscrPremio: "$510.000",
                    bonificacion: "$800.000",
                    retiro: "6% (DA SE PAGA CON LA LICITACION)"
                }
            ]
        },

        // JEEP
        {
            marca: "JEEP",
            modelo: "RENEGADE SPORT",
            precio: 46046000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 40%",
                    pea1: "4-9-12/40%",
                    pea2: "24-36/30%",
                    suscrNeutra: "$490.000",
                    suscrPremio: "$530.000",
                    bonificacion: "$500.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "JEEP",
            modelo: "COMPASS SPORT 270 AT6",
            precio: 55198000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "DIC 50%",
                    pea1: "4-9-12/40%",
                    pea2: "24-36/30%",
                    suscrNeutra: "$580.000",
                    suscrPremio: "$620.000",
                    bonificacion: "$700.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "RAM",
            modelo: "RAMPAGE REBEL 2.0L GME AT9 4X4",
            precio: 68211000,
            financiaciones: [
                {
                    tipo: "60/40",
                    cuotas: "84",
                    sobrepauta: "DIC 50%",
                    pea1: "4-9-12-24-36/40%",
                    pea2: "",
                    suscrNeutra: "$620.000",
                    suscrPremio: "$660.000",
                    bonificacion: "$700.000",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        },
        {
            marca: "RAM",
            modelo: "DAKOTA WARLOCK 2.2 TURBO AT8 4X4",
            precio: 69000000,
            financiaciones: [
                {
                    tipo: "70/30",
                    cuotas: "84",
                    sobrepauta: "ENE 30%",
                    pea1: "4-9-12/35%",
                    pea2: "24-36/30%",
                    suscrNeutra: "$660.000",
                    suscrPremio: "$700.000",
                    bonificacion: "",
                    retiro: "6.5% + DA (2.5%)"
                }
            ]
        }

    ];

    // =======================================================================
    // ELEMENTOS DEL DOM PARA PAUTAS
    // =======================================================================
    const brandFilter = document.getElementById('brandFilter');
    const modelFilter = document.getElementById('modelFilter');
    const sobrepautaFilter = document.getElementById('sobrepautaFilter');
    const resetFilters = document.getElementById('resetFilters');
    const modelsTable = document.getElementById('modelsTable');

    if (!brandFilter || !modelsTable) {
        console.error('❌ Elementos críticos no encontrados para la página de pautas');
        return;
    }

    // =======================================================================
    // FUNCIONALIDAD PRINCIPAL PAUTAS
    // =======================================================================

    // Aplanar datos para la tabla
    const tableData = [];
    allModelsData.forEach(model => {
        model.financiaciones.forEach(financiacion => {
            tableData.push({
                marca: model.marca,
                modelo: model.modelo,
                precio: model.precio,
                tipo: financiacion.tipo,
                cuotas: financiacion.cuotas,
                sobrepauta: financiacion.sobrepauta,
                pea1: financiacion.pea1,
                pea2: financiacion.pea2,
                suscrPremio: financiacion.suscrPremio,
                suscrNeutra: financiacion.suscrNeutra,
                bonificacion: financiacion.bonificacion,
                retiro: financiacion.retiro
            });
        });
    });

    // Cargar datos en la tabla
    function loadTableData(models) {
        const tableBody = modelsTable.querySelector('tbody');
        if (!tableBody) {
            console.error('No se encontró el tbody de la tabla');
            return;
        }

        tableBody.innerHTML = '';

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
                <td>${model.modelo}</td>
                <td>${model.tipo}</td>
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

    // Filtrar modelos
    function filterModels() {
        const modelFilterValue = modelFilter.value.toLowerCase();
        const brandFilterValue = brandFilter.value;
        const sobrepautaFilterValue = sobrepautaFilter.value;

        const filteredModels = tableData.filter(model => {
            // Filtrar por modelo (nombre)
            const matchesModel = model.modelo.toLowerCase().includes(modelFilterValue) ||
                model.marca.toLowerCase().includes(modelFilterValue);

            // Filtrar por marca
            const matchesBrand = brandFilterValue === '' ||
                model.marca.toLowerCase() === brandFilterValue.toLowerCase();

            // Filtrar por sobrepauta
            let matchesSobrepauta = true;
            if (sobrepautaFilterValue === 'con') {
                matchesSobrepauta = model.sobrepauta && model.sobrepauta.trim() !== "";
            } else if (sobrepautaFilterValue === 'sin') {
                matchesSobrepauta = !model.sobrepauta || model.sobrepauta.trim() === "";
            }

            return matchesModel && matchesBrand && matchesSobrepauta;
        });

        loadTableData(filteredModels);
    }

    // Cargar marcas en el filtro
    function loadBrandFilter() {
        const brands = [...new Set(tableData.map(model => model.marca))].sort();

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    // =======================================================================
    // CALCULADORA DE INTEGRACIONES - VERSIÓN MEJORADA Y DEBUGGEADA
    // =======================================================================
    function initCalculadora() {
        console.log('🔄 Inicializando calculadora de integraciones...');

        const marcaCalculadora = document.getElementById('marcaCalculadora');
        const vehicleSelect = document.getElementById('vehicleSelect');
        const financiacionSelect = document.getElementById('financiacionSelect');
        const precioVehiculo = document.getElementById('precioVehiculo');
        const tipoAdjudicacion = document.getElementById('tipoAdjudicacion');
        const cuotaAdjudicar = document.getElementById('cuotaAdjudicar');
        const calcularBtn = document.getElementById('calcularBtn');

        if (!vehicleSelect || !calcularBtn) {
            console.warn('❌ Elementos de la calculadora no encontrados');
            return;
        }

        console.log('✅ Todos los elementos de calculadora encontrados');

        // Cargar marcas en la calculadora
        function loadMarcasCalculadora() {
            if (!marcaCalculadora) return;

            marcaCalculadora.innerHTML = '<option value="">Todas las marcas</option>';
            const marcas = [...new Set(allModelsData.map(model => model.marca))].sort();

            marcas.forEach(marca => {
                const option = document.createElement('option');
                option.value = marca;
                option.textContent = marca;
                marcaCalculadora.appendChild(option);
            });

            console.log('Marcas cargadas en calculadora:', marcas.length);
        }

        // Cargar vehículos en la calculadora
        function loadVehiclesCalculadora(marcaFiltro = '') {
            console.log('Cargando vehículos para marca:', marcaFiltro);

            vehicleSelect.innerHTML = '<option value="">-- Seleccione un vehículo --</option>';
            financiacionSelect.innerHTML = '<option value="">-- Seleccione financiación --</option>';
            precioVehiculo.value = '';

            const modelsToShow = marcaFiltro
                ? allModelsData.filter(model => model.marca === marcaFiltro)
                : allModelsData;

            console.log('Modelos a mostrar:', modelsToShow.length);

            modelsToShow.forEach(model => {
                const option = document.createElement('option');
                option.value = model.modelo;
                option.textContent = `${model.marca} ${model.modelo}`;
                option.setAttribute('data-precio', model.precio);
                option.setAttribute('data-marca', model.marca);
                option.setAttribute('data-financiaciones', JSON.stringify(model.financiaciones));
                vehicleSelect.appendChild(option);
            });

            console.log('Vehículos cargados:', modelsToShow.length);
        }

        // Cargar financiaciones cuando se selecciona un vehículo - VERSIÓN CORREGIDA
        function loadFinanciaciones() {
            console.log('Ejecutando loadFinanciaciones...');

            const selectedIndex = vehicleSelect.selectedIndex;
            if (selectedIndex === -1 || selectedIndex === 0) {
                financiacionSelect.innerHTML = '<option value="">-- Seleccione financiación --</option>';
                precioVehiculo.value = '';
                console.log('No hay vehículo seleccionado');
                return;
            }

            const selectedOption = vehicleSelect.options[selectedIndex];
            const precio = selectedOption.getAttribute('data-precio');
            const financiacionesData = selectedOption.getAttribute('data-financiaciones');

            if (!financiacionesData) {
                console.error('No se encontraron datos de financiaciones');
                return;
            }

            const financiaciones = JSON.parse(financiacionesData);

            // Actualizar precio
            precioVehiculo.value = `$${parseInt(precio).toLocaleString()}`;

            // Cargar financiaciones - LIMPIAR PRIMERO
            financiacionSelect.innerHTML = '';

            // Agregar opción por defecto
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Seleccione financiación --';
            financiacionSelect.appendChild(defaultOption);

            // Agregar opciones de financiación
            financiaciones.forEach((fin, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${fin.tipo} - ${fin.cuotas} cuotas`;
                financiacionSelect.appendChild(option);
            });

            console.log('Financiaciones cargadas:', financiaciones.length);
            console.log('Opciones en select:', financiacionSelect.options.length);
        }

        // Función mejorada para extraer números de strings como "$350.000", "1.700.000", etc.
        function extractNumber(str) {
            if (!str) return 0;

            console.log('Extrayendo número de:', str);

            // Caso especial para bonificaciones complejas
            if (str.includes('si adjudica') || str.includes('caso contrario')) {
                // Para strings como "$1.700.000 si adjudica cuota 2 caso contrario $500.000 en GR"
                // Tomar el primer número encontrado (el más favorable)
                const firstMatch = str.match(/\$?(\d+[\d.]*\d+)/);
                if (firstMatch) {
                    const numberStr = firstMatch[1].replace(/\./g, '');
                    const result = parseInt(numberStr);
                    console.log('Número extraído (caso complejo):', result);
                    return result;
                }
            }

            // Para casos normales como "$350.000", "350.000", etc.
            const match = str.toString().match(/\$?(\d+[\d.]*\d+)/);
            if (match) {
                const numberStr = match[1].replace(/\./g, '');
                const result = parseInt(numberStr);
                console.log('Número extraído:', result);
                return result;
            }

            console.log('No se pudo extraer número, retornando 0');
            return 0;
        }

        // Función mejorada para extraer porcentaje de strings como "6-9-12 / 40%", "4-9-12/40%", etc.
        function extractPercentage(text, cuotaBuscada) {
            if (!text) {
                console.log('Texto vacío para extraer porcentaje');
                return 0;
            }

            console.log(`Buscando porcentaje para cuota ${cuotaBuscada} en:`, text);

            // Primero intentar: buscar patrones específicos como "cuota / porcentaje%"
            const regexEspecifico = new RegExp(`(^|\\s|,)${cuotaBuscada}\\s*[\\/-]\\s*(\\d+)%`, 'i');
            const matchEspecifico = text.match(regexEspecifico);
            if (matchEspecifico) {
                const porcentaje = parseInt(matchEspecifico[2]);
                console.log('Porcentaje encontrado (específico):', porcentaje);
                return porcentaje;
            }

            // Segundo intento: buscar en listas como "4-6-9-12 / 35%"
            const listMatch = text.match(/([\d\-\/]+)\s*\/\s*(\d+)%/);
            if (listMatch) {
                const cuotasStr = listMatch[1];
                const porcentaje = parseInt(listMatch[2]);

                // Verificar si la cuota buscada está en la lista
                const cuotas = cuotasStr.split(/[-\/]/).map(c => c.trim());
                if (cuotas.includes(cuotaBuscada.toString())) {
                    console.log('Porcentaje encontrado (en lista):', porcentaje);
                    return porcentaje;
                }
            }

            // Tercer intento: buscar porcentajes generales como "40%"
            const porcentajeGeneral = text.match(/(\d+)%/);
            if (porcentajeGeneral) {
                const porcentaje = parseInt(porcentajeGeneral[1]);
                console.log('Porcentaje general encontrado:', porcentaje);
                return porcentaje;
            }

            console.log('No se encontró porcentaje, retornando 0');
            return 0;
        }

        // Calcular integración - VERSIÓN MEJORADA CON MÁS DEBUG
        function calcularIntegracion() {
            const selectedVehicle = vehicleSelect.options[vehicleSelect.selectedIndex];
            const financiacionIndex = financiacionSelect.value;

            if (!selectedVehicle || !selectedVehicle.value || financiacionIndex === '') {
                alert('Por favor, seleccione un vehículo y tipo de financiación.');
                return;
            }

            const precio = parseInt(selectedVehicle.getAttribute('data-precio'));
            const financiaciones = JSON.parse(selectedVehicle.getAttribute('data-financiaciones'));
            const financiacion = financiaciones[parseInt(financiacionIndex)];
            const tipoAdj = tipoAdjudicacion.value;
            const cuotaAdj = parseInt(cuotaAdjudicar.value);

            console.log('=== INICIO CÁLCULO ===');
            console.log('Datos para cálculo:', {
                vehiculo: selectedVehicle.textContent,
                precio,
                tipoAdjudicacion: tipoAdj,
                cuotaAdjudicar: cuotaAdj,
                financiacionSeleccionada: financiacion
            });

            // Calcular porcentaje según tipo de adjudicación
            let porcentajeIntegracion = 0;

            switch (tipoAdj) {
                case 'sobrepauta':
                    console.log('Calculando SOBREPAUTA:', financiacion.sobrepauta);
                    if (financiacion.sobrepauta) {
                        const match = financiacion.sobrepauta.match(/(\d+)%/);
                        porcentajeIntegracion = match ? parseInt(match[1]) : 0;
                        console.log('Porcentaje sobrepauta extraído:', porcentajeIntegracion);
                    }
                    break;

                case 'pea1':
                    console.log('Calculando PEA1:', financiacion.pea1);
                    porcentajeIntegracion = extractPercentage(financiacion.pea1, cuotaAdj);
                    break;

                case 'pea2':
                    console.log('Calculando PEA2:', financiacion.pea2);
                    porcentajeIntegracion = extractPercentage(financiacion.pea2, cuotaAdj);
                    break;
            }

            // Obtener suscripción y bonificación
            let suscripcion = 0;
            if (tipoAdj === 'sobrepauta' || tipoAdj === 'pea1') {
                console.log('Usando suscripción PREMIO:', financiacion.suscrPremio);
                suscripcion = extractNumber(financiacion.suscrPremio);
            } else {
                console.log('Usando suscripción NEUTRA:', financiacion.suscrNeutra);
                suscripcion = extractNumber(financiacion.suscrNeutra);
            }

            // Calcular montos
            const totalIntegrar = Math.round(precio * (porcentajeIntegracion / 100));
            const integracionFinal = Math.max(0, totalIntegrar + suscripcion);

            console.log('=== RESULTADOS DEL CÁLCULO ===');
            console.log({
                precioVehiculo: precio,
                porcentajeIntegracion: porcentajeIntegracion + '%',
                totalIntegrar: totalIntegrar,
                suscripcion: suscripcion,
                integracionFinal: integracionFinal
            });

            // Mostrar resultados
            document.getElementById('resultPrecio').textContent = `$${precio.toLocaleString()}`;
            document.getElementById('resultPorcentaje').textContent = `${porcentajeIntegracion}%`;
            document.getElementById('resultTotal').textContent = `$${totalIntegrar.toLocaleString()}`;
            document.getElementById('resultSuscripcion').textContent = `$${suscripcion.toLocaleString()}`;
            document.getElementById('resultFinal').textContent = `$${integracionFinal.toLocaleString()}`;

            console.log('=== FIN CÁLCULO ===');
        }

        // EVENT LISTENERS MEJORADOS
        if (marcaCalculadora) {
            marcaCalculadora.addEventListener('change', function () {
                console.log('Marca cambiada:', this.value);
                loadVehiclesCalculadora(this.value);
                // Limpiar selecciones dependientes
                financiacionSelect.innerHTML = '<option value="">-- Seleccione financiación --</option>';
                precioVehiculo.value = '';
            });
        }

        vehicleSelect.addEventListener('change', function () {
            console.log('Vehículo cambiado:', this.value, 'Índice:', this.selectedIndex);
            loadFinanciaciones();
        });

        financiacionSelect.addEventListener('change', function () {
            console.log('Financiación seleccionada:', this.value, 'Texto:', this.options[this.selectedIndex]?.textContent);
        });

        calcularBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Botón calcular clickeado');
            calcularIntegracion();
        });

        // Inicializar calculadora
        loadMarcasCalculadora();
        loadVehiclesCalculadora();

        console.log('✅ Calculadora de integraciones inicializada correctamente');
    }

    // =======================================================================
    // EVENT LISTENERS PAUTAS
    // =======================================================================
    modelFilter.addEventListener('input', filterModels);
    brandFilter.addEventListener('change', filterModels);
    sobrepautaFilter.addEventListener('change', filterModels);

    resetFilters.addEventListener('click', function () {
        modelFilter.value = '';
        brandFilter.value = '';
        sobrepautaFilter.value = 'todos';
        loadTableData(tableData);
    });

    // =======================================================================
    // INICIALIZACIÓN COMPLETA
    // =======================================================================
    loadBrandFilter();
    loadTableData(tableData);
    initCalculadora();

    console.log('✅ Página de pautas comerciales inicializada correctamente');
}

// =======================================================================
// DETECCIÓN DE PÁGINAS Y INICIALIZACIÓN
// =======================================================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM cargado - Iniciando aplicación');

    const currentPath = window.location.pathname.toLowerCase();
    const cleanPath = currentPath.replace(/\/$/, ''); // quita la barra final si existe

    const isIndexPage = cleanPath.endsWith('/index.html') || cleanPath === '' || cleanPath === '/';
    const isPreciosPage = cleanPath.includes('/precios') || cleanPath.includes('precios.html');
    const isPautasPage = cleanPath.includes('/pautas') || cleanPath.includes('pautas.html');

    console.log('📍 Página detectada:', cleanPath);
    console.log({ index: isIndexPage, precios: isPreciosPage, pautas: isPautasPage });

    console.log('📍 Página detectada:', {
        path: currentPath,
        index: isIndexPage,
        precios: isPreciosPage,
        pautas: isPautasPage
    });

    // Ejecutar según el tipo de página
    if (isIndexPage) {
        console.log('✅ Inicializando comparador de equipamientos...');
        initComparadorEquipamientos();
    }

    if (isPreciosPage) {
        console.log('✅ Inicializando comparador de precios...');
        initComparadorPrecios();
    }

    if (isPautasPage) {
        console.log('✅ Inicializando página de pautas comerciales...');
        initFiatModelsPage();
    }

    console.log('🎯 Aplicación inicializada correctamente');
});