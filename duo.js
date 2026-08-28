// duo.js - Lógica del Catálogo Duo Shop Store (Plan Starter)
// Versión corregida y optimizada sin bloqueos de caché

const WHATSAPP_NUMERO = "584140000000"; // Edítalo con tu número real

const storeConfig = {
  nombre_tienda: "Duo Shop Store",
  tasa_cambio: 36.50,
  simbolo_moneda_alt: "Bs.",
  mensaje_bienvenida: "¡Bienvenidos a Duo Shop Store!"
};

// CATÁLOGO DE PRODUCTOS DE EJEMPLO
let productosList = [
  {
    id_producto: "duo-001",
    nombre: "Mascarilla Hidratante L'Oréal Pro",
    categoria: "Skincare",
    marca: "L'Oréal",
    precio_usd: 18.50,
    imagen_url: "https://images.unsplash.com/photo-1608248597359-f52915f60acd?w=400",
    activo: true
  },
  {
    id_producto: "duo-002",
    nombre: "Base de Maquillaje Fit Me Maybelline",
    categoria: "Maquillaje",
    marca: "Maybelline",
    precio_usd: 12.99,
    imagen_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
    activo: true
  },
  {
    id_producto: "duo-003",
    nombre: "Paleta de Sombras Naked Urban Decay",
    categoria: "Maquillaje",
    marca: "Urban Decay",
    precio_usd: 45.00,
    imagen_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400",
    activo: true,
    destacado: true
  },
  {
    id_producto: "duo-004",
    nombre: "Serum Facial Vitamina C",
    categoria: "Skincare",
    marca: "The Ordinary",
    precio_usd: 14.50,
    imagen_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    activo: true
  },
  {
    id_producto: "duo-005",
    nombre: "Vestido Casual Verano",
    categoria: "Ropa",
    marca: "Duo Import",
    precio_usd: 28.00,
    imagen_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400",
    activo: true
  },
  {
    id_producto: "duo-006",
    nombre: "Labial Matte de Larga Duración",
    categoria: "Maquillaje",
    marca: "Maybelline",
    precio_usd: 11.00,
    imagen_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
    activo: true
  }
];

let carrito = JSON.parse(localStorage.getItem("duo_carrito")) || [];
let categoriaActiva = "TODOS";
let modoMonedaBs = false;
let tipoEntregaSeleccionada = "delivery";

document.addEventListener("DOMContentLoaded", () => {
  const elNombre = document.getElementById("nombre-tienda");
  const elFooter = document.getElementById("footer-nombre");
  const elBienvenida = document.getElementById("mensaje-bienvenida");

  if (elNombre) elNombre.textContent = storeConfig.nombre_tienda;
  if (elFooter) elFooter.textContent = storeConfig.nombre_tienda;
  if (elBienvenida) elBienvenida.textContent = storeConfig.mensaje_bienvenida;
  
  // Ocultar texto de carga si existe
  const loadingEl = document.getElementById("loading");
  if (loadingEl) loadingEl.style.display = "none";

  renderizarCategorias();
  renderizarProductos(productosList);
  actualizarContadorCarrito();
});

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

function renderizarProductos(lista) {
  const grid = document.getElementById("grid-productos");
  if (!grid) return;
  grid.innerHTML = "";

  const tasa = Number(storeConfig.tasa_cambio) || 1;
  const simAlt = storeConfig.simbolo_moneda_alt;

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
    
    const textoPrecioMain = modoMonedaBs ? `${simAlt} ${precioBs}` : `$${precioUSD.toFixed(2)}`;
    const textoPrecioSub = modoMonedaBs ? `($${precioUSD.toFixed(2)})` : `(${simAlt} ${precioBs})`;

    let badgeHTML = prod.destacado ? `<span class="product-badge badge-popular">Popular</span>` : "";

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div style="position: relative;">
        ${badgeHTML}
        <img class="product-img" src="${prod.imagen_url}" alt="${prod.nombre}" loading="lazy">
        <span class="product-brand">${prod.marca || ''}</span>
        <h4 class="product-title">${prod.nombre}</h4>
      </div>
      <div>
        <div class="product-price-main">${textoPrecioMain}</div>
        <div class="product-price-sub">${textoPrecioSub}</div>
        <button class="btn-add" onclick="agregarAlCarrito('${prod.id_producto}')">
          <i class="fa-solid fa-plus"></i> Agregar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filtrarProductos() {
  const inputBusqueda = document.getElementById("input-busqueda");
  const query = inputBusqueda ? inputBusqueda.value.toLowerCase() : "";
  
  const filtrados = productosList.filter(prod => {
    const coincideCat = categoriaActiva === "TODOS" || prod.categoria === categoriaActiva;
    const coincideTexto = prod.nombre.toLowerCase().includes(query) || (prod.marca && prod.marca.toLowerCase().includes(query));
    return coincideCat && coincideTexto;
  });
  renderizarProductos(filtrados);
}

function toggleMoneda() {
  modoMonedaBs = !modoMonedaBs;
  const labelCurrency = document.getElementById("label-currency");
  if (labelCurrency) {
    labelCurrency.textContent = modoMonedaBs ? "Ver en USD" : "Ver en Bs.";
  }
  filtrarProductos();
}

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
  let totalUSD = 0;

  carrito.forEach(item => {
    totalUSD += item.precio_usd * item.cantidad;
    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <div>
        <div class="cart-item-name">${item.nombre}</div>
        <div class="cart-item-price">$${item.precio_usd.toFixed(2)} x ${item.cantidad}</div>
      </div>
      <button onclick="eliminarDelCarrito('${item.id}')" style="background:none; border:none; color:red; cursor:pointer;">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;
    container.appendChild(row);
  });

  const totalBs = totalUSD * tasa;
  document.getElementById("total-usd").textContent = `$${totalUSD.toFixed(2)}`;
  document.getElementById("total-bs").textContent = `Bs. ${totalBs.toFixed(2)}`;
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito();
  actualizarContadorCarrito();
  renderizarCarrito();
}

function iniciarCheckout() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }
  let mensaje = "¡Hola! Deseo realizar el siguiente pedido en Duo Shop Store:\n\n";
  let totalUSD = 0;
  carrito.forEach(item => {
    mensaje += `- ${item.cantidad}x ${item.nombre} ($${(item.precio_usd * item.cantidad).toFixed(2)})\n`;
    totalUSD += item.precio_usd * item.cantidad;
  });
  mensaje += `\n*Total a pagar: $${totalUSD.toFixed(2)}*`;
  
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}
