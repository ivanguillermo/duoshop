// duo.js - Lógica del Catálogo Duo Shop Store (Plan Starter)

// CONFIGURACIÓN BÁSICA
// !!! EDITA ESTA LÍNEA CON EL NÚMERO DE DUO SHOP STORE (Incluye cód. de país, sin + ni espacios) !!!
const WHATSAPP_NUMERO = "584126216661"; 

const storeConfig = {
  nombre_tienda: "Duo Shop Store",
  tasa_cambio: 791, // Tasa BCV de ejemplo, cámbiala manualmente aquí si no usas la versión con Google Sheets
  simbolo_moneda_alt: "Bs.",
  mensaje_bienvenida: "¡Bienvenidos a Duo Shop Store!"
};

// CATÁLOGO DE PRODUCTOS DE EJEMPLO (Placeholder)
let productosList = [
  {
    id_producto: "duo-001",
    nombre: "Mascarilla Hidratante L'Oréal Pro",
    categoria: "Cabello",
    marca: "L'Oréal",
    precio_usd: 18.50,
    imagen_url: "https://http2.mlstatic.com/D_NQ_NP_699059-MLV43752478143_102020-O.jpg",
    activo: true
  },
  {
    id_producto: "duo-002",
    nombre: "Base de Maquillaje Fit Me Maybelline",
    categoria: "Maquillaje",
    marca: "Maybelline",
    precio_usd: 12.99,
    imagen_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk8K_uO4U5I_fI1n9g6i3i4h3k3g7i3i9LqQ&s",
    activo: true
  },
  {
    id_producto: "duo-003",
    nombre: "Paleta de Sombras Naked Urban Decay",
    categoria: "Maquillaje",
    marca: "Urban Decay",
    precio_usd: 45.00,
    imagen_url: "https://m.media-amazon.com/images/I/713w-ab0-HL._AC_SX679_.jpg",
    activo: true,
    destacado: true // Etiqueta Más Vendido
  },
  {
    id_producto: "duo-004",
    nombre: "Serum Facial Vitamina C The Ordinary",
    categoria: "Skincare",
    marca: "The Ordinary",
    precio_usd: 14.50,
    imagen_url: "https://images.ctfassets.net/wlrcs7jkz5g3/6J0iI3I3I3I3I3I3I3I3I9/378301948349f31e8f48e644e245830f/TO_100_VCSS_01.png?q=70",
    activo: true
  },
  {
    id_producto: "duo-005",
    nombre: "Vestido Casual Verano - Varios Talles",
    categoria: "Ropa",
    marca: "Duo Import",
    precio_usd: 28.00,
    imagen_url: "https://img.ltwebstatic.com/images3_pi/2022/05/16/16526908157e6a5c447b75f8a14a4b1b46851a16e8_thumbnail_900x.webp",
    activo: true
  },
  {
    id_producto: "duo-006",
    nombre: "Labial SuperStay Matte Ink Maybelline",
    categoria: "Maquillaje",
    marca: "Maybelline",
    precio_usd: 11.00,
    imagen_url: "https://i5.walmartimages.com/seo/Maybelline-SuperStay-Matte-Ink-Liquid-Lipstick-Pioneer_980c5d8b-9b8e-4745-8522-f45099070d7e.041a7df783b4d09e0381495a96d26760.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    activo: true,
    stock: 0 // Etiqueta Agotado
  }
];

// LÓGICA DE LA APLICACIÓN (No editar)
let carrito = JSON.parse(localStorage.getItem("duo_carrito")) || [];
let categoriaActiva = "TODOS";
let modoMonedaBs = false; // Empieza en USD
let toastTimeout;
let tipoEntregaSeleccionada = "delivery";
let direccionCliente = "";
let metodoPagoSeleccionado = "Pago Móvil (Bs.)";

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización
  document.getElementById("nombre-tienda").textContent = storeConfig.nombre_tienda;
  document.getElementById("footer-nombre").textContent = storeConfig.nombre_tienda;
  document.getElementById("mensaje-bienvenida").textContent = storeConfig.mensaje_bienvenida;
  
  // Mostrar tasa referencial (estática en plan starter)
  const simAlt = storeConfig.simbolo_moneda_alt;
  const tasaValor = storeConfig.tasa_cambio;
  const heroText = document.querySelector(".store-hero .hero-text");
  if(heroText && tasaValor) {
      const tasaP = document.createElement('p');
      tasaP.innerHTML = `Tasa BCV Referencial: <strong>1 USD = ${simAlt} ${tasaValor.toFixed(2)}</strong>`;
      heroText.appendChild(tasaP);
  }

  renderizarCategorias();
  renderizarProductos(productosList);
  actualizarContadorCarrito();
});

// Renderizar Categorías
function renderizarCategorias() {
  const container = document.getElementById("categorias-container");
  if (!container) return;
  
  const categorias = ["TODOS", ...new Set(productosList.map(p => p.categoria).filter(Boolean))];
  
  container.innerHTML = categorias.map(cat => `
    <button class="cat-btn ${cat === categoriaActiva ? 'active' : ''}" onclick="seleccionarCategoria('${cat}')">
      ${cat}
    </button>
  `).join("");
}

function seleccionarCategoria(cat) {
  categoriaActiva = cat;
  renderizarCategorias();
  filtrarProductos();
}

// Renderizar Productos
function renderizarProductos(lista) {
  const grid = document.getElementById("grid-productos");
  if (!grid) return;
  grid.innerHTML = "";

  const tasa = Number(storeConfig.tasa_cambio) || 1;
  const simAlt = storeConfig.simbolo_moneda_alt;

  // Filtrar por categoría activa primero
  const productosFiltrados = lista.filter(prod => 
    (categoriaActiva === "TODOS" || prod.categoria === categoriaActiva) && prod.activo
  );

  if (productosFiltrados.length === 0) {
    grid.innerHTML = "<p style='grid-column: span 2; text-align: center; color: #64748b; padding: 20px;'>No hay productos en esta categoría.</p>";
    return;
  }

  productosFiltrados.forEach(prod => {
    const precioUSD = Number(prod.precio_usd);
    const precioBs = (precioUSD * tasa).toFixed(2);
    const stockActual = prod.stock !== undefined ? prod.stock : 99;
    const estaAgotado = stockActual <= 0;
    const esDestacado = prod.destacado;

    const textoPrecioMain = modoMonedaBs 
      ? `${simAlt} ${precioBs}` 
      : `$${precioUSD.toFixed(2)}`;
      
    const textoPrecioSub = modoMonedaBs 
      ? `($${precioUSD.toFixed(2)})` 
      : `(${simAlt} ${precioBs})`;

    let badgeHTML = "";
    if (estaAgotado) {
      badgeHTML = `<span class="product-badge badge-agotado">Agotado</span>`;
    } else if (esDestacado) {
        badgeHTML = `<span class="product-badge badge-popular"><i class="fa-solid fa-fire"></i> Más Vendido</span>`;
    }

    const card = document.createElement("div");
    card.className = `product-card ${estaAgotado ? 'card-agotado' : ''}`;
    card.innerHTML = `
      <div style="position: relative;">
        ${badgeHTML}
        <img class="product-img" src="${prod.imagen_url || 'https://i.imgur.com/fQhO7fI.png'}" alt="${prod.nombre}" loading="lazy">
        <span class="product-brand">${prod.marca || ''}</span>
        <h4 class="product-title">${prod.nombre}</h4>
      </div>
      <div>
        <div class="product-price-main">${textoPrecioMain}</div>
        <div class="product-price-sub">${textoPrecioSub}</div>
        ${estaAgotado 
          ? `<button class="btn-add btn-disabled" disabled>Agotado</button>` 
          : `<button class="btn-add" onclick="agregarAlCarrito('${prod.id_producto}')"><i class="fa-solid fa-plus"></i> Agregar</button>`
        }
      </div>
    `;
    grid.appendChild(card);
  });
}

// Filtro de Búsqueda
function filtrarProductos() {
  const inputBusqueda = document.getElementById("input-busqueda");
  const query = inputBusqueda ? inputBusqueda.value.toLowerCase() : "";
  
  const filtrados = productosList.filter(prod => {
    const coincideCat = categoriaActiva === "TODOS" || prod.categoria === categoriaActiva;
    const coincideTexto = prod.nombre.toLowerCase().includes(query) || (prod.marca && prod.marca.toLowerCase().includes(query));
    return coincideCat && coincideTexto;
  });
  renderizarProductos(filtrados); // Renderiza pero mantiene la categoría activa
}

// Switch de Moneda
function toggleMoneda() {
  modoMonedaBs = !modoMonedaBs;
  const labelCurrency = document.getElementById("label-currency");
  if (labelCurrency) {
    labelCurrency.textContent = modoMonedaBs ? "Ver en USD" : "Ver en Bs.";
  }
  filtrarProductos();
  
  const modalCarrito = document.getElementById("modal-carrito");
  if (modalCarrito && !modalCarrito.classList.contains("hidden")) {
    renderizarCarrito();
  }
}

// Manejo del Carrito
function agregarAlCarrito(id) {
  const prod = productosList.find(p => p.id_producto === id);
  if (!prod) return;

  const itemEnCarrito = carrito.find(item => item.id === id);
  if (itemEnCarrito) {
    itemEnCarrito.cantidad += 1;
  } else {
    carrito.push({
      id: prod.id_producto,
      nombre: prod.nombre,
      precio_usd: prod.precio_usd,
      cantidad: 1
    });
  }

  guardarCarrito();
  actualizarContadorCarrito();
  mostrarToast(`Agregado: ${prod.nombre}`);
}

function modificarCantidad(id, delta) {
  const index = carrito.findIndex(item => item.id === id);
  if (index === -1) return;

  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }

  guardarCarrito();
  actualizarContadorCarrito();
  renderizarCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito();
  actualizarContadorCarrito();
  renderizarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("duo_carrito", JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;
  }
}

function toggleCarrito() {
  const modal = document.getElementById("modal-carrito");
  if (!modal) return;
  modal.classList.toggle("hidden");
  if (!modal.classList.contains("hidden")) {
    renderizarCarrito();
  }
}

function renderizarCarrito() {
  const container = document.getElementById("items-carrito");
  if (!container) return;
  container.innerHTML = "";
  
  if (carrito.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #94a3b8; margin-top: 30px;">
      <i class="fa-solid fa-basket-shopping" style="font-size: 2rem; margin-bottom: 10px;"></i>
      <p>Tu carrito está vacío</p>
    </div>`;
    document.getElementById("total-usd").textContent = "$0.00";
    document.getElementById("total-bs").textContent = "Bs. 0.00";
    return;
  }

  const tasa = Number(storeConfig.tasa_cambio) || 1;
  const simAlt = storeConfig.simbolo_moneda_alt;
  let totalUSD = 0;

  carrito.forEach(item => {
    const subtotalUSD = item.precio_usd * item.cantidad;
    totalUSD += subtotalUSD;

    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nombre}</div>
        <div class="cart-item-price">$${item.precio_usd.toFixed(2)} c/u</div>
      </div>
      <div class="cart-qty-controls">
        <button class="btn-qty" onclick="modificarCantidad('${item.id}', -1)">-</button>
        <span style="font-weight: 600; font-size: 13px; min-width: 20px; text-align:center;">${item.cantidad}</span>
        <button class="btn-qty" onclick="modificarCantidad('${item.id}', 1)">+</button>
        <button class="btn-remove" onclick="eliminarDelCarrito('${item.id}')" title="Eliminar">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  // Cálculo de Delivery (Fijo en Plan Starter)
  let costoDeliveryUSD = 0;
  if (tipoEntregaSeleccionada === "delivery") {
    // Ejemplo: delivery fijo de $2.00. En plan starter no hay zonas variables.
    costoDeliveryUSD = 2.00;
  }

  const totalGeneralUSD = totalUSD + costoDeliveryUSD;
  const totalBs = totalGeneralUSD * tasa;

  // Mostrar totales
  document.getElementById("total-usd").textContent = `$${totalGeneralUSD.toFixed(2)}`;
  document.getElementById("total-bs").textContent = `${simAlt} ${totalBs.toFixed(2)}`;

  // Mostrar/Ocultar campos de delivery
  const wrapperZona = document.getElementById("contenedor-zona-wrapper");
  const wrapperDir = document.getElementById("contenedor-direccion");
  const labelTotalBs = document.getElementById("label-total-bs");
  
  // Ocultar selección de zona compleja en starter
  if(wrapperZona) wrapperZona.style.display = "none";

  if (tipoEntregaSeleccionada === "pickup") {
    if (wrapperDir) wrapperDir.style.display = "none";
  } else {
    if (wrapperDir) wrapperDir.style.display = "block";
  }
  
  if(labelTotalBs) labelTotalBs.textContent = `Total Bs (Tasa ${tasa.toFixed(2)}):`;
}

function cambiarTipoEntrega(tipo) {
  tipoEntregaSeleccionada =
