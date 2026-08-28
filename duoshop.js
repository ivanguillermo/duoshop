// URL DE TU WEB APP DE GOOGLE APPS SCRIPT (Reemplaza con tu URL desplegada)
const API_URL = "https://script.google.com/macros/s/AKfycbys7czBNdbtlgjgJrRVmO2ghb3pqf5B-0FyxCleHL5baYbNg76h3OjiA6-EwxzQtMFY/exec";

let allProducts = [];
let filteredProducts = [];
let currentCategory = "todos";
let currentSearch = "";
let currentPage = 1;
const itemsPerPage = 12; // 12 por página en mobile (se ajusta a 4 por fila en desktop)

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupEventListeners();
});

function fetchProducts() {
    // Si no tienes configurada la URL aún, puedes descomentar datos de prueba:
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
        // Opcional: abrir script que genera el PDF en Drive
    });
}

function filterAndRender() {
    filteredProducts = allProducts.filter(item => {
        const matchesCategory = currentCategory === "todos" || item.categoria.toLowerCase() === currentCategory.toLowerCase();
        const matchesSearch = item.titulo.toLowerCase().includes(currentSearch) || item.descripcion.toLowerCase().includes(currentSearch);
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
        html += `
            <div class="product-card" onclick="openModal('${item.id}')">
                <div class="product-img-wrap">
                    <span class="product-cat-tag">${item.categoria}</span>
                    <img src="${item.imagen || 'duo_logo.jpg'}" alt="${item.titulo}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${item.titulo}</h3>
                    <p class="product-desc">${item.descripcion}</p>
                    <div class="product-footer">
                        <span class="product-price">$${Number(item.precio).toFixed(2)}</span>
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
    const product = allProducts.find(p => String(p.id) === String(id));
    if (!product) return;

    document.getElementById("modalImg").src = product.imagen || 'duo_logo.jpg';
    document.getElementById("modalCategory").innerText = product.categoria;
    document.getElementById("modalTitle").innerText = product.titulo;
    document.getElementById("modalPrice").innerText = `$${Number(product.precio).toFixed(2)}`;
    document.getElementById("modalDesc").innerText = product.descripcion;

    const waText = encodeURIComponent(`¡Hola Duo Shop Store! Estoy interesado/a en el producto: *${product.titulo}* ($${product.precio}) que vi en su catálogo web.`);
    document.getElementById("modalWaBtn").href = `https://wa.me/message/UOXSVOEIG73ME1?text=${waText}`;

    document.getElementById("productModal").classList.add("active");
}

function closeModal() {
    document.getElementById("productModal").classList.remove("active");
}

