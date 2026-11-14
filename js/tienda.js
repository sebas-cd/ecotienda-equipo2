// Constantes tarifarias y ambientales (COP por kWh y kg CO2 por kWh en Colombia)
const TARIFA_ENERGIA_KWH = 950;
const FACTOR_EMISION_CO2 = 0.164;

// Arreglo de objetos literales: 9 productos en 3 categorías
const productos = [
    {
        id: 1,
        nombre: "Bombillo LED 9W Luz Cálida",
        categoria: "iluminacion",
        precio: 12000,
        potenciaViejo: 60,
        potenciaNuevo: 9,
        horasDia: 6
    },
    {
        id: 2,
        nombre: "Panel LED Empotrable 18W",
        categoria: "iluminacion",
        precio: 28000,
        potenciaViejo: 75,
        potenciaNuevo: 18,
        horasDia: 8
    },
    {
        id: 3,
        nombre: "Reflector Solar LED 100W Exterior",
        categoria: "solar",
        precio: 145000,
        potenciaViejo: 150,
        potenciaNuevo: 0,
        horasDia: 10
    },
    {
        id: 4,
        nombre: "Kit Generador Solar Portátil 300W",
        categoria: "solar",
        precio: 650000,
        potenciaViejo: 300,
        potenciaNuevo: 0,
        horasDia: 5
    },
    {
        id: 5,
        nombre: "Nevera No Frost Inverter 390L",
        categoria: "electrodomesticos",
        precio: 2150000,
        potenciaViejo: 380,
        potenciaNuevo: 140,
        horasDia: 12
    },
    {
        id: 6,
        nombre: "Aire Acondicionado Inverter 12000 BTU",
        categoria: "electrodomesticos",
        precio: 1750000,
        potenciaViejo: 1600,
        potenciaNuevo: 850,
        horasDia: 7
    },
    {
        id: 7,
        nombre: "Lavadora Carga Frontal Inverter 18kg",
        categoria: "electrodomesticos",
        precio: 1980000,
        potenciaViejo: 800,
        potenciaNuevo: 350,
        horasDia: 2
    },
    {
        id: 8,
        nombre: "Tubo LED T8 18W para Oficinas",
        categoria: "iluminacion",
        precio: 16500,
        potenciaViejo: 40,
        potenciaNuevo: 18,
        horasDia: 10
    },
    {
        id: 9,
        nombre: "Inversor Solar Onda Pura 1.5kW",
        categoria: "solar",
        precio: 1120000,
        potenciaViejo: 500,
        potenciaNuevo: 50,
        horasDia: 6
    }
];

// Arreglo mutable del carrito
let carrito = [];

// ==========================================
// FUNCIONES PROPIAS (Cálculos y Formatos)
// ==========================================

// 1. Calcula el ahorro mensual en kWh (30 días)
function calcularAhorroKwhMes(potenciaViejo, potenciaNuevo, horasDia) {
    const deltaWatts = potenciaViejo - potenciaNuevo;
    return ((deltaWatts * horasDia * 30) / 1000);
}

// 2. Calcula el ahorro mensual monetario en COP
function calcularAhorroPesosMes(kwhAhorrados) {
    return Math.round(kwhAhorrados * TARIFA_ENERGIA_KWH);
}

// 3. Formato estandarizado en Pesos Colombianos (COP)
function formatearPesos(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

// 4. Retorna el nombre legible de la categoría
function obtenerNombreCategoria(codigoCategoria) {
    const categorias = {
        iluminacion: "Iluminación Eficiente",
        electrodomesticos: "Línea Blanca Inverter",
        solar: "Energía Solar y Aislada"
    };
    return categorias[codigoCategoria] || "General";
}

// 5. Función nueva: Calcula los kg de CO2 evitados al mes
function calcularReduccionCO2(kwhAhorrados) {
    return (kwhAhorrados * FACTOR_EMISION_CO2).toFixed(2);
}

// 6. Función nueva: Elimina un producto específico del carrito por su índice
function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    actualizarCarrito();
}

// ==========================================
// RENDERIZADO DEL CATÁLOGO EN EL DOM
// ==========================================
const contenedorProductos = document.querySelector("#productos");

function renderizarProductos(lista) {
    if (!contenedorProductos) return;

    if (lista.length === 0) {
        contenedorProductos.innerHTML = `<p class="text-muted">No se encontraron productos que coincidan con la búsqueda.</p>`;
        return;
    }

    let html = "";
    lista.forEach(producto => {
        const ahorroKwh = calcularAhorroKwhMes(producto.potenciaViejo, producto.potenciaNuevo, producto.horasDia);
        const ahorroPesos = calcularAhorroPesosMes(ahorroKwh);
        const co2Evitado = calcularReduccionCO2(ahorroKwh);

        html += `
            <article class="tarjeta">
                <div>
                    <span class="badge bg-secondary mb-2">${obtenerNombreCategoria(producto.categoria)}</span>
                    <h3>${producto.nombre}</h3>
                    <p class="badge-potencia">
                        Reemplaza equipo de ${producto.potenciaViejo} W por ${producto.potenciaNuevo} W (${producto.horasDia} h/día).
                    </p>
                    <p class="ahorro-resaltado mb-1">
                        Ahorro: ~${ahorroKwh.toFixed(1)} kWh/mes (${formatearPesos(ahorroPesos)}/mes)
                    </p>
                    <p class="small text-muted mb-2">
                        Impacto ambiental: Evita <strong>${co2Evitado} kg de CO₂</strong>/mes
                    </p>
                </div>
                <div>
                    <h4 class="fw-bold my-2">${formatearPesos(producto.precio)}</h4>
                    <button class="btn btn-primary w-100 btn-agregar" data-id="${producto.id}">
                        Agregar al carrito
                    </button>
                </div>
            </article>
        `;
    });

    contenedorProductos.innerHTML = html;
    asignarEventosAgregar();
}

// ==========================================
// FILTROS Y BUSCADOR EN TIEMPO REAL
// ==========================================
let categoriaActual = "todas";
let terminoBusqueda = "";

function aplicarFiltrosYBusqueda() {
    let resultado = productos;

    if (categoriaActual !== "todas") {
        resultado = resultado.filter(item => item.categoria === categoriaActual);
    }

    if (terminoBusqueda.trim() !== "") {
        resultado = resultado.filter(item =>
            item.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
        );
    }

    renderizarProductos(resultado);
}

// Botones de filtro por categoría
const botonesFiltro = document.querySelectorAll(".filtro");
botonesFiltro.forEach(boton => {
    boton.addEventListener("click", () => {
        botonesFiltro.forEach(btn => btn.classList.remove("activo"));
        boton.classList.add("activo");

        categoriaActual = boton.dataset.categoria;
        aplicarFiltrosYBusqueda();
    });
});

// Buscador por texto con evento 'input'
const inputBuscador = document.querySelector("#buscador");
if (inputBuscador) {
    inputBuscador.addEventListener("input", (evento) => {
        terminoBusqueda = evento.target.value;
        aplicarFiltrosYBusqueda();
    });
}

// ==========================================
// GESTIÓN DINÁMICA DEL CARRITO
// ==========================================
function asignarEventosAgregar() {
    const botonesAgregar = document.querySelectorAll(".btn-agregar");
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id, 10);
            const productoSeleccionado = productos.find(p => p.id === id);
            if (productoSeleccionado) {
                carrito.push(productoSeleccionado);
                actualizarCarrito();
            }
        });
    });
}

function actualizarCarrito() {
    const listaCarrito = document.querySelector("#lista-carrito");
    const totalElemento = document.querySelector("#total");
    const ahorroElemento = document.querySelector("#ahorro");
    const amortizacionElemento = document.querySelector("#amortizacion");

    if (!listaCarrito) return;

    listaCarrito.innerHTML = "";

    let totalCosto = 0;
    let totalAhorroMensual = 0;

    carrito.forEach((item, index) => {
        const ahorroKwh = calcularAhorroKwhMes(item.potenciaViejo, item.potenciaNuevo, item.horasDia);
        const ahorroPesos = calcularAhorroPesosMes(ahorroKwh);

        totalCosto += item.precio;
        totalAhorroMensual += ahorroPesos;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.nombre}</span>
            <div class="d-flex align-items-center gap-2">
                <strong>${formatearPesos(item.precio)}</strong>
                <button class="btn btn-outline-danger btn-sm py-0 px-2" onclick="eliminarDelCarrito(${index})" title="Quitar producto">
                    ×
                </button>
            </div>
        `;
        listaCarrito.appendChild(li);
    });

    totalElemento.textContent = `Total inversión: ${formatearPesos(totalCosto)}`;
    ahorroElemento.textContent = `Ahorro mensual total: ${formatearPesos(totalAhorroMensual)}`;

    if (totalAhorroMensual > 0) {
        const mesesRetorno = (totalCosto / totalAhorroMensual).toFixed(1);
        amortizacionElemento.textContent = `Tiempo de recuperación: la inversión se paga sola en ~${mesesRetorno} meses.`;
    } else {
        amortizacionElemento.textContent = "";
    }
}

// Botón para vaciar todo el carrito
const botonVaciar = document.querySelector("#vaciar");
if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
        carrito = [];
        actualizarCarrito();
    });
}

// Renderizado inicial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    renderizarProductos(productos);
});