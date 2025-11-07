const productContainer = document.getElementById("product-container");
const cartIcon = document.getElementById('cart-button');
const cartList = document.querySelector('.cart-list');
const productSection = document.getElementById("product-section");
const currencySelect = document.getElementById("basic-select");
const currencies = ["USD", "ETB"];

let currentImageIndex = 0;
let currentCurrency;
let imgList = [];
let products = [];

let exchangeRates = {}; // store fetched rates once
const EXCHANGE_STORAGE_KEY = "exchangeRatesData";

const itemInStock = (id) => {
  return products.find(item => item.id === id)?.inStock || false;
};

function populateCurrencyOptions() {
  currencies.forEach(curr => {
    const option = document.createElement("option");
    option.value = curr;
    option.textContent = curr;
    if (curr === "ETB") option.selected = true; // ✅ default to USD
    currencySelect.appendChild(option);
  });
}


// helper function to check if stored data is from today
function isToday(timestamp) {
  const savedDate = new Date(timestamp).toDateString();
  const today = new Date().toDateString();
  return savedDate === today;
}

async function callApi(base = "USD") {
  try {
    // ---- 1. Try to load cached rates for today ----
    const savedData = JSON.parse(localStorage.getItem(EXCHANGE_STORAGE_KEY));
    if (savedData && isToday(savedData.date) && savedData.base === base) {
      exchangeRates = savedData.rates;               // already have USD → ETB etc.
      console.log("Loaded exchange rates from localStorage:", exchangeRates);
      return;
    }

    // ---- 2. Fetch fresh rates from the CDN API ----
    console.log("Fetching new exchange rates…");
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.min.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();               // { usd: { etb: 118.45, ... } }
    // The API returns the base object directly, e.g. data.usd
    const baseKey = base.toLowerCase();
    exchangeRates = data[baseKey] || {};

    // ---- 3. Cache for the rest of the day ----
    localStorage.setItem(
      EXCHANGE_STORAGE_KEY,
      JSON.stringify({
        base,
        rates: exchangeRates,
        date: Date.now()
      })
    );
    console.log("Exchange rates updated & saved:", exchangeRates);
  } catch (e) {
    console.error("Error fetching rates:", e);
    // Keep the old (possibly stale) rates so the UI still works
    const saved = JSON.parse(localStorage.getItem(EXCHANGE_STORAGE_KEY));
    if (saved) exchangeRates = saved.rates;
  }
}

function convertCurrency(amount, from, to) {
  if (!exchangeRates[from] || !exchangeRates[to]) return null;

  const amountInUSD = amount / exchangeRates[from];
  const converted = amountInUSD * exchangeRates[to];

  return Math.round(converted * 100) / 100;
}
document.addEventListener('click', (e) => {
  // --- Modal Description Click ---
  const descElement = e.target.closest('.desc');
  if (descElement) {
    const productId = parseInt(descElement.dataset.id);
    openModal(productId);
    return;
  }

  // --- Cart Item Remove ---
  const removeBtn = e.target.closest('.cart-item-remove');
  if (removeBtn) {
    e.stopPropagation();
    removeItem(removeBtn);
    return;
  }

  // --- Add to Cart ---
  const addToCartBtn = e.target.closest('.btn:not([aria-disabled="true"])');
  if (addToCartBtn && addToCartBtn.textContent.includes('Add To Cart')) {
    const productId = parseInt(addToCartBtn.dataset.id);
    AddTocart(productId);
    return;
  }

  // --- Clear Cart ---
  const clearCartBtn = e.target.closest('#clear-cart');
  if (clearCartBtn) {
    e.stopPropagation();
    if (confirm("Are you sure you want to clear your cart?")) {
      localStorage.removeItem("cart");
      updateCartUI();
      alert("Cart cleared!");
    }
    return;
  }

  // --- Proceed to Checkout ---
  const checkoutBtn = e.target.closest('#checkout-btn');
  if (checkoutBtn) {
    e.stopPropagation();
    proceedToCheckout();
    return;
  }

  // --- Modal Image Navigation (optional if you use these buttons) ---
  if (e.target.classList.contains('img-nav')) {
    const direction = e.target.classList.contains('left') ? -1 : 1;
    scrollImages(direction);
    return;
  }

  // --- Cart Toggle ---
  if (e.target.closest('#cart-button')) {
    e.stopPropagation();
    cartList.classList.toggle('open');
    return;
  }

  // --- Click Outside to Close Cart ---
  if (!e.target.closest('.cart-list')) {
    cartList.classList.remove('open');
  }
});

window.addEventListener("DOMContentLoaded", async () => {


  showLoader();

  try {   
    populateCurrencyOptions();
    await callApi();
    products = await fetchProducts();
    processImageLists(products);
    console.log(products);
    renderProducts(products);
    const cart = loadCart(products);
    updateCartUI(cart);
    attachCartEventListeners();
  } catch (error) {
    showError("Failed to load products. Please try again later.");
    console.error(error);
  } finally {
    hideLoader();
    loadBurgerMenu(); // Optional, depending on your setup
  }
});
function showLoader() {
  document.getElementById("loader").style.display = "block";
  
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}
async function fetchProducts() {
  const response = await fetch("/api/dbs/fetchProduct", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({}) 
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}


function processImageLists(products) {
  products.forEach(p => {
    if (typeof p.imageLists === "string") {
      try {
        p.imageLists = JSON.parse(p.imageLists);
      } catch {
        p.imageLists = [p.image];
      }
    }
  });
}

function loadCart(products) {
  const rawCart = localStorage.getItem("cart");
  let storedCart = [];

  try {
    if (rawCart && rawCart !== "undefined") {
      storedCart = JSON.parse(rawCart);
    }
  } catch (e) {
    console.warn("Corrupted cart detected. Resetting to empty.");
    localStorage.setItem("cart_backup", rawCart);  // backup for later inspection
    localStorage.removeItem("cart");  // only clear the broken one
    storedCart = [];
  }

  return storedCart.filter(item => itemInStock(item.id));
}


function updateCartUI(cart) {
  if (!Array.isArray(cart)) {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }

  const cartCount = document.getElementById("cart-count");
  const cartItems = document.getElementById("cart-items");

  localStorage.setItem("cart", JSON.stringify(cart));
  cartCount.textContent = cart.length;
  cartItems.innerHTML = "";

  const currentCurrency = currencySelect.value;

  cart.forEach(item => {
    let displayPrice = item.price; // USD base
    if (currentCurrency !== "USD") {
      displayPrice = convertCurrency(item.price, "USD", currentCurrency);
    }

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <img src="${item.image}" alt="Artwork Thumbnail" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price" data-price-usd="${item.price}">
          ${currentCurrency} ${displayPrice ? displayPrice.toFixed(2) : "N/A"}
        </div>
      </div>
      <button class="cart-item-remove">✖</button>
    `;
    cartItems.appendChild(li);
  });

  updateCartTotal();
}




function attachCartEventListeners() {
  const clearCartBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", (e) => {
      console.log("clicked the clear button")
      e.stopPropagation();
      if (confirm("Are you sure you want to clear your cart?")) {
        localStorage.removeItem("cart");
        updateCartUI([]);
        alert("Cart cleared!");
        console.log("clicked the clear button")

      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      proceedToCheckout();
    });
  }
}

function showError(message) {
  const productSection = document.getElementById("product-section");
  productSection.innerHTML += `<p>${message}</p>`;
}

const AddTocart = (productId) => {
  const selectedProduct = products.find(p => p.id === productId);
  
  if (!selectedProduct) {
    console.error(`Product with ID ${productId} not found.`);
    return;
  }

  if (!selectedProduct.inStock) {
    alert("This product is currently out of stock."); 
    return;
  }

  let storedCart = JSON.parse(localStorage.getItem("cart")) || [];
  const currencyData = {
    selectedCurrency: currencySelect.value,
    exchangeRates: exchangeRates
  };
  localStorage.setItem("selectedCurrency", JSON.stringify(currencyData));


  if (storedCart.some(item => item.id === selectedProduct.id)) {
    alert("This product is already in your cart.");
    return;
  }

  const cartItem = {
    id: selectedProduct.id,
    title: selectedProduct.title,
    price: selectedProduct.priceNew,
    currency: currentCurrency,
    image: selectedProduct.image,
    category: selectedProduct.category,
    features: selectedProduct.features,
    inStock: selectedProduct.inStock
  };

  storedCart.push(cartItem);
  localStorage.setItem("cart", JSON.stringify(storedCart));
  updateCartUI(storedCart);
};




const updateCartTotal = () => {
  const currentCurrency = currencySelect.value;
  let total = 0;
  console.log("At least reached the update cart")

  document.querySelectorAll(".cart-item-price").forEach(priceEl => {
    const priceUSD = parseFloat(priceEl.dataset.priceUsd); 
    if (!isNaN(priceUSD)) {
      total += convertCurrency(priceUSD, "USD", currentCurrency); 
    }
  });

  document.getElementById("cart-total").textContent = `${currentCurrency} ${total.toFixed(2)}`;
};


const removeItem = (btn) => {
  const item = btn.closest(".cart-item");
  if (item) {
    const title = item.querySelector(".cart-item-title").textContent;
    let storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    storedCart = storedCart.filter(p => p.title !== title);
    localStorage.setItem("cart", JSON.stringify(storedCart));
    updateCartUI();
  }
};

function openModal(id) {
  let selectedCurrency = currencySelect.value;
  const baseCurrency = "USD";
  const productData = products.find(p => p.id === id);
  if (!productData) {
    console.error("Product not found:", id);
    return;
  }

  imgList = Array.isArray(productData.imagelists) ? productData.imagelists : [productData.image];
  currentImageIndex = 0;

  // ✅ Preload images
  imgList.forEach(url => {
    const preload = new Image();
    preload.src = url;
  });

  const convertedNew = convertCurrency(productData.priceNew, baseCurrency, selectedCurrency);

  const existingModal = document.getElementById("product-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "product-modal";
  modal.className = "modal";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="container">
      <div class="imgBx">
        <button class="img-nav left">&#10094;</button>
        <img src="${imgList[0]}" alt="${productData.title} Image" id="product-image">
        <button class="img-nav right">&#10095;</button>
      </div>
      <div class="details">
        <div class="content">
          <h2>${productData.title}<br>
            <span>${productData.category}</span>
          </h2>
          <p>${productData.description}</p>
          <div class="tag-container desc-tags">
            ${productData.features.map(tag => `<span class="tags">#${tag}</span>`).join("")}
          </div>
          <div class="pandb">
            <h3 class="modal-price">${selectedCurrency} ${convertedNew ? convertedNew.toFixed(2) : "N/A"}</h3>
            <button class="btn" data-id="${productData.id}">
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

  productContainer.appendChild(modal);

  // Close when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

 
}

function renderProducts(productList) {
  const baseCurrency = "USD"; // assume your product prices are stored in USD
  const selectedCurrency = currencySelect.value;

  productContainer.innerHTML = "";

  productList.forEach(product => {
    const convertedOld = convertCurrency(product.priceOld, baseCurrency, selectedCurrency);
    const convertedNew = convertCurrency(product.priceNew, baseCurrency, selectedCurrency);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="badge">${product.inStock ? 'NEW DROP' : 'SOLD OUT'}</div>
      <div class="tilt">
        <div class="img">
          <img src="${product.image}" alt="${product.title}">
        </div>
      </div>
      <div class="info">
        <div class="cat">${product.category}</div>
        <h2 class="title">${product.title}</h2>
        <p class="desc" role="button" data-id="${product.id}">
          ${product.shortDesc}...
          <br>
          <span class="read-more">Read More</span>
        </p>
        <div class="feats">
          ${product.features.map(f => `<span class="feat">${f}</span>`).join("")}
        </div>
        <div class="bottom">
          <div class="price">
            <span class="old">${selectedCurrency} ${convertedOld ? convertedOld.toFixed(2) : "N/A"}</span>
            <span class="new">${selectedCurrency} ${convertedNew ? convertedNew.toFixed(2) : "N/A"}</span>
          </div>
          <button class="btn" ${product.inStock ? `data-id="${product.id}"` : 'disabled aria-disabled="true"'}>
            <span>Add To Cart</span>
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>
        </div>
        <div class="stock">${product.inStock ? "In Stock" : "Out of Stock"}</div>
      </div>
    `;
    productContainer.appendChild(card);
  });
}
currencySelect.addEventListener("change", () => {
  renderProducts(products);
  updateCartUI();
});


// Cart toggle
cartIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  cartList.classList.toggle('open');
});


// Close cart on outside click
window.addEventListener('click', () => {
  cartList.classList.remove("open");
});

function loadBurgerMenu() {
  const burgerMenu = document.querySelector('.burger-menu');
  const nav = document.querySelector('nav');
  const body = document.body;
  const html = document.documentElement;
  const socialLinks = document.querySelector('.social-links');

  if (burgerMenu && nav) {
    burgerMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('active');
      burgerMenu.classList.toggle('active');
      
      if (socialLinks) {
        if (nav.classList.contains('active')) {
          setTimeout(() => {
            if (nav.classList.contains('active')) {
              socialLinks.classList.add('active');
            }
          }, 350);
        } else {
          socialLinks.classList.remove('active');
        }
      }
      
      if (nav.classList.contains('active')) {
        body.classList.add('no-scroll');
        html.classList.add('no-scroll');
      } else {
        body.classList.remove('no-scroll');
        html.classList.remove('no-scroll');
      }

      burgerMenu.setAttribute('aria-expanded', nav.classList.contains('active'));
    });
  }
}
function proceedToCheckout() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  if (!cartItems.length) return alert('Cart empty');

  // Pass *only* what checkout needs
  const payload = {
    selectedCurrency: currencySelect.value,
    exchangeRates: exchangeRates,
    cart: cartItems
  };
  localStorage.setItem('checkoutPayload', JSON.stringify(payload));
  window.location.href = './checkout page/checkout.html';
}