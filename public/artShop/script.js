// main.js – TimeLess Emotion Art Shop (Production Ready)
const productContainer = document.getElementById("product-container");
const cartIcon = document.getElementById('cart-button');
const cartList = document.querySelector('.cart-list');
const currencySelect = document.getElementById("basic-select");
const currencies = ["USD", "ETB"];
let currentImageIndex = 0;
let products = [];
let exchangeRates = {};
const EXCHANGE_STORAGE_KEY = "exchangeRatesData";

const itemInStock = (id) => products.find(p => p.id === id)?.inStock ?? false;

function populateCurrencyOptions() {
  currencies.forEach(curr => {
    const option = document.createElement("option");
    option.value = curr;
    option.textContent = curr;
    if (curr === "ETB") option.selected = true;
    currencySelect.appendChild(option);
  });
}

function isToday(timestamp) {
  return new Date(timestamp).toDateString() === new Date().toDateString();
}

async function callApi(base = "USD") {
  try {
    const saved = JSON.parse(localStorage.getItem(EXCHANGE_STORAGE_KEY));
    if (saved && isToday(saved.date) && saved.base === base) {
      exchangeRates = saved.rates;
      return;
    }

    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.min.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    exchangeRates = data[base.toLowerCase()] || {};

    localStorage.setItem(EXCHANGE_STORAGE_KEY, JSON.stringify({
      base,
      rates: exchangeRates,
      date: Date.now()
    }));
  } catch (e) {
    console.error("Exchange rate fetch failed:", e);
    const fallback = JSON.parse(localStorage.getItem(EXCHANGE_STORAGE_KEY));
    if (fallback) exchangeRates = fallback.rates;
  }
}

function convertCurrency(amount, from = "USD", to = "ETB") {
  if (!exchangeRates[from.toLowerCase()] || !exchangeRates[to.toLowerCase()]) {
    return amount; // fallback to original if rates missing
  }
  return (amount / exchangeRates[from.toLowerCase()]) * exchangeRates[to.toLowerCase()];
}

// Unified click handler
document.addEventListener('click', (e) => {
  const target = e.target;

  // Modal open
  if (target.closest('.desc')) {
    const id = parseInt(target.closest('.desc').dataset.id);
    openModal(id);
    return;
  }

  // Remove from cart
  if (target.closest('.cart-item-remove')) {
    removeItem(target.closest('.cart-item-remove'));
    return;
  }

  // Add to cart
  const addBtn = target.closest('.btn:not([aria-disabled="true"])');
  if (addBtn && addBtn.textContent.includes('Add To Cart')) {
    const id = parseInt(addBtn.dataset.id);
    AddTocart(id);
    return;
  }

  // Clear cart
  if (target.closest('#clear-cart')) {
    if (confirm("Clear cart?")) {
      localStorage.removeItem("cart");
      updateCartUI([]);
      alert("Cart cleared!");
    }
    return;
  }

  // Checkout
  if (target.closest('#checkout-btn')) {
    proceedToCheckout();
    return;
  }

  // Image nav
  if (target.classList.contains('img-nav')) {
    scrollImages(target.classList.contains('left') ? -1 : 1);
    return;
  }

  // Cart toggle
  if (target.closest('#cart-button')) {
    cartList.classList.toggle('open');
    return;
  }

  // Close cart on outside click
  if (!target.closest('.cart-list') && !target.closest('#cart-button')) {
    cartList.classList.remove('open');
  }
});

// Load everything
window.addEventListener("DOMContentLoaded", async () => {
  showLoader();
  try {
    populateCurrencyOptions();
    await callApi();
    products = await fetchProducts();
    processImageLists(products);
    renderProducts(products);

    const cart = loadCart();
    updateCartUI(cart);
  } catch (err) {
    showError("Failed to load shop. Please refresh.");
    console.error("Shop load failed:", err);
  } finally {
    hideLoader();
    loadBurgerMenu();
  }
});

function showLoader() { document.getElementById("loader").style.display = "block"; }
function hideLoader() { document.getElementById("loader").style.display = "none"; }

async function fetchProducts() {
  const res = await fetch("/api/dbs/fetchProduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function processImageLists(products) {
  products.forEach(p => {
    if (typeof p.imageLists === "string") {
      try { p.imageLists = JSON.parse(p.imageLists); }
      catch { p.imageLists = [p.image]; }
    }
    p.imagelists = p.imageLists || [p.image];
  });
}

function loadCart() {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw || raw === "undefined") return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(item => itemInStock(item.id)) : [];
  } catch (e) {
    console.warn("Corrupted cart – resetting");
    localStorage.removeItem("cart");
    return [];
  }
}

function updateCartUI(cart = loadCart()) {
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.length;
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

  const curr = currencySelect.value;
  cart.forEach(item => {
    const price = convertCurrency(item.price, "USD", curr);
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <img src="${item.image}" alt="" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price" data-price-usd="${item.price}">
          ${curr} ${price ? price.toFixed(2) : "N/A"}
        </div>
      </div>
      <button class="cart-item-remove">X</button>
    `;
    container.appendChild(li);
  });
  updateCartTotal();
}

function updateCartTotal() {
  const curr = currencySelect.value;
  let total = 0;
  document.querySelectorAll(".cart-item-price").forEach(el => {
    const usd = parseFloat(el.dataset.priceUsd);
    if (!isNaN(usd)) total += convertCurrency(usd, "USD", curr);
  });
  document.getElementById("cart-total").textContent = `${curr} ${total.toFixed(2)}`;
}

function AddTocart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return console.error("Product not found:", id);
  if (!product.inStock) return alert("Out of stock!");

  let cart = loadCart();
  if (cart.some(i => i.id === id)) return alert("Already in cart!");

  cart.push({
    id: product.id,
    title: product.title,
    price: product.priceNew,
    image: product.image,
    category: product.category
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI(cart);
  console.log(`ADDED TO CART → "${product.title}" | ID: ${id}`);
}

function removeItem(btn) {
  const item = btn.closest(".cart-item");
  const title = item.querySelector(".cart-item-title").textContent;
  let cart = loadCart();
  cart = cart.filter(i => i.title !== title);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI(cart);
}

function openModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const curr = currencySelect.value;
  const price = convertCurrency(product.priceNew, "USD", curr);
  const images = product.imagelists;

  const modal = document.createElement("div");
  modal.id = "product-modal";
  modal.className = "modal";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="container">
      <div class="imgBx">
        <button class="img-nav left">Left Arrow</button>
        <img src="${images[0]}" id="product-image">
        <button class="img-nav right">Right Arrow</button>
      </div>
      <div class="details">
        <div class="content">
          <h2>${product.title}<br><span>${product.category}</span></h2>
          <p>${product.description || "No description"}</p>
          <div class="tag-container desc-tags">
            ${product.features?.map(t => `<span class="tags">#${t}</span>`).join("") || ""}
          </div>
          <div class="pandb">
            <h3 class="modal-price">${curr} ${price ? price.toFixed(2) : "N/A"}</h3>
            <button class="btn" data-id="${product.id}">
              <span>Add To Cart</span>
              <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>
            <div class="artwork-badge">Limited Edition</div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Preload images
  images.forEach(src => new Image().src = src);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}

function renderProducts(list) {
  const curr = currencySelect.value;
  productContainer.innerHTML = "";
  list.forEach(p => {
    const price = convertCurrency(p.priceNew, "USD", curr);
    const oldPrice = convertCurrency(p.priceOld || p.priceNew * 1.3, "USD", curr);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="badge">${p.inStock ? 'NEW DROP' : 'SOLD OUT'}</div>
      <div class="tilt"><div class="img"><img src="${p.image}" alt="${p.title}"></div></div>
      <div class="info">
        <div class="cat">${p.category}</div>
        <h2 class="title">${p.title}</h2>
        <p class="desc" data-id="${p.id}">${p.shortDesc}...<br><span class="read-more">Read More</span></p>
        <div class="feats">${p.features?.map(f => `<span class="feat">${f}</span>`).join("")}</div>
        <div class="bottom">
          <div class="price">
            <span class="old">${curr} ${oldPrice.toFixed(2)}</span>
            <span class="new">${curr} ${price.toFixed(2)}</span>
          </div>
          <button class="btn" ${p.inStock ? `data-id="${p.id}"` : 'disabled aria-disabled="true"'}>
            <span>Add To Cart</span>
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>
        </div>
        <div class="stock">${p.inStock ? "In Stock" : "Out of Stock"}</div>
      </div>
    `;
    productContainer.appendChild(card);
  });
}

currencySelect.addEventListener("change", () => {
  renderProducts(products);
  updateCartUI();
});

function proceedToCheckout() {
  const cart = loadCart();
  if (!cart.length) return alert("Your cart is empty!");

  const payload = {
    selectedCurrency: currencySelect.value,
    exchangeRates,
    cartItems: cart,
    total: document.getElementById("cart-total").textContent.split(" ")[1]
  };

  localStorage.setItem('checkoutPayload', JSON.stringify(payload));
  window.location.href = './checkout page/checkout.html';
}

// Burger menu (unchanged – already perfect)
function loadBurgerMenu() {
  const burger = document.querySelector('.burger-menu');
  const nav = document.querySelector('nav');
  const social = document.querySelector('.social-links');
  if (!burger || !nav) return;

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('active');
    burger.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
    document.documentElement.classList.toggle('no-scroll');

    if (social) {
      social.classList.toggle('active', nav.classList.contains('active'));
    }
  });
}