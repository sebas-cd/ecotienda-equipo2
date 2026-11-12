// Constante tarifaria oficial para cálculos (COP por kWh)
const TARIFA_ENERGIA_KWH = 950;

// Arreglo de objetos literales
const productos = [
    {
        id: 1,
        nombre: "Bombillo LED 9W Luz Cálida",
        categoria: "iluminacion",
        precio: 12000,
        potenciaViejo: 60, // Watts equipo anterior
        potenciaNuevo: 9,   // Watts equipo nuevo
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
        potenciaNuevo: 0, // Aislado de la red: consumo de red = 0W
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
        horasDia: 12 // Ciclo promedio de compresión
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
// FUNCIONES OBLIGATORIAS
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

// 4. Retorna el nombre legible y etiqueta de la categoría
function obtenerNombreCategoria(codigoCategoria) {
    const categorias = {
        iluminacion: "Iluminación Eficiente",
        electrodomesticos: "Línea Blanca Inverter",
        solar: "Energía Solar y Aislada"
    };
    return categorias[codigoCategoria] || "General";
}

// ==========================================
// RENDERIZADO DEL CATÁLOGO
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

        html += `
            <article class="tarjeta">
                <div>
                    <span class="badge bg-secondary mb-2">${obtenerNombreCategoria(producto.categoria)}</span>
                    <h3>${producto.nombre}</h3>
                    <p class="badge-potencia">
                        Sustituye equipo de ${producto.potenciaViejo} W por ${producto.potenciaNuevo} W (${producto.horasDia} h/día).
                    </p>
                    <p class="ahorro-resaltado">
                        Ahorro: ~${ahorroKwh.toFixed(1)} kWh/mes (${formatearPesos(ahorroPesos)}/mes)
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
// FILTROS Y BUSCADOR
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

// Botones de filtro de categoría
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
// GESTIÓN DEL CARRITO
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
            <span><strong>${formatearPesos(item.precio)}</strong></span>
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

// Botón para vaciar carrito
const botonVaciar = document.querySelector("#vaciar");
if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
        carrito = [];
        actualizarCarrito();
    });
}

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
    renderizarProductos(productos);
});