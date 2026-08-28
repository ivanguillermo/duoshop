// URL DE TU WEB APP DE GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbys7czBNdbtlgjgJrRVmO2ghb3pqf5B-0FyxCleHL5baYbNg76h3OjiA6-EwxzQtMFY/exec";

let allProducts = [];
let filteredProducts = [];
let currentCategory = "todos";
let currentSearch = "";
let currentPage = 1;
const itemsPerPage = 12;

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupEventListeners();
});

function fetchProducts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            filterAndRender();
        })
        .catch(err => {
            console.error("Error al cargar productos:", err);
            document.getElementById("productsGrid").innerHTML = `
                <div class="loading-state" style="color: #e74c3c;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Error al conectar con Google Sheets. Verifica la URL del Apps Script o usa datos de prueba.
                </div>
            `;
        });
}

function setupEventListeners() {
    // Búsqueda
    document.getElementById("searchBtn").addEventListener("click", () => {
        currentSearch = document.getElementById("searchInput").value.trim().toLowerCase();
        currentPage = 1;
        filterAndRender();
    });

    document.getElementById("searchInput").addEventListener("keyup", (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        currentPage = 1;
        filterAndRender();
    });

    // Categorías
    const catButtons = document.querySelectorAll(".cat-btn");
    catButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            catButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentCategory = e.target.getAttribute("data-category");
            currentPage = 1;
            filterAndRender();
        });
    });

    // Modal cerrar
    document.getElementById("closeModal").addEventListener("click", closeModal);
    document.getElementById("modalOverlay").addEventListener("click", closeModal);

    // Botón PDF
    document.getElementById("downloadPdfBtn").addEventListener("click", () => {
        alert("Generando catálogo PDF oficial a través de Google Apps Script y Google Slides...");
    });
}

function filterAndRender() {
    filteredProducts = allProducts.filter(item => {
        // USO DE PROTECCIÓN (|| ""): Evita que falle si alguna celda está vacía (undefined)
        const categoriaItem = (item.categoria || "").toLowerCase();
        const tituloItem = (item.Titulo || "").toLowerCase();
        const descItem = (item.descripcion || "").toLowerCase();

        const matchesCategory = currentCategory === "todos" || categoriaItem === currentCategory.toLowerCase();
        const matchesSearch = tituloItem.includes(currentSearch) || descItem.includes(currentSearch);
        
        return matchesCategory && matchesSearch;
    });

    document.getElementById("productCountInfo").innerText = `Mostrando ${filteredProducts.length} artículos`;
    renderGrid();
    renderPagination();
}

function renderGrid() {
    const grid = document.getElementById("productsGrid");
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="loading-state">No se encontraron productos con esos criterios.</div>`;
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredProducts.slice(startIndex, endIndex);

    let html = "";
    paginatedItems.forEach(item => {
        // NOTA: Se usa item.ID y item.Titulo con mayúsculas tal cual están en tu Google Sheet
        const idProd = item.ID || '';
        const tituloProd = item.Titulo || 'Sin título';
        const catProd = item.categoria || 'General';
        const descProd = item.descripcion || '';
        const precioProd = Number(item.precio) || 0;
        const imagenProd = item.imagen || item.imagen_link || 'duo_logo.jpg';

        html += `
            <div class="product-card" onclick="openModal('${idProd}')">
                <div class="product-img-wrap">
                    <span class="product-cat-tag">${catProd}</span>
                    <img src="${imagenProd}" alt="${tituloProd}" loading="lazy" onerror="this.src='duo_logo.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${tituloProd}</h3>
                    <p class="product-desc">${descProd}</p>
                    <div class="product-footer">
                        <span class="product-price">$${precioProd.toFixed(2)}</span>
                        <button class="btn-card-detail">Ver más</button>
                    </div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const container = document.getElementById("paginationContainer");
    
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = "";
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderGrid();
    window.scrollTo({ top: document.getElementById("catalogo").offsetTop - 100, behavior: 'smooth' });
}

function openModal(id) {
    const product = allProducts.find(p => String(p.ID) === String(id));
    if (!product) return;

    document.getElementById("modalImg").src = product.imagen || product.imagen_link || 'duo_logo.jpg';
    document.getElementById("modalCategory").innerText = product.categoria || '';
    document.getElementById("modalTitle").innerText = product.Titulo || '';
    document.getElementById("modalPrice").innerText = `$${Number(product.precio || 0).toFixed(2)}`;
    document.getElementById("modalDesc").innerText = product.descripcion || '';

    const tituloModal = product.Titulo || 'este producto';
    const precioModal = product.precio || '0';
    const waText = encodeURIComponent(`¡Hola Duo Shop Store! Estoy interesado/a en el producto: *${tituloModal}* ($${precioModal}) que vi en su catálogo web.`);
    document.getElementById("modalWaBtn").href = `https://wa.me/message/UOXSVOEIG73ME1?text=${waText}`;

    document.getElementById("productModal").classList.add("active");
}

function closeModal() {
    document.getElementById("productModal").classList.remove("active");
}

