import { supabase } from './config/supabaseClient.js';

const productContainer = document.getElementById("product-container");
const cartIcon = document.getElementById('cart-button');
const cartList = document.querySelector('.cart-list');
const productSection = document.getElementById("product-section");

let currentImageIndex = 0;
let imgList = [];
let products = [];

const itemInStock = (id) => {
  return products.find(item => item.id === id)?.inStock || false;
};

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
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw new Error(error.message);
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
    // Optionally: Keep the corrupted version for inspection:
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

  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <img src="${item.image}" alt="Artwork Thumbnail" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price" data-price="${item.price}">ETB ${item.price}</div>
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
      e.stopPropagation();
      if (confirm("Are you sure you want to clear your cart?")) {
        localStorage.removeItem("cart");
        updateCartUI([]);
        alert("Cart cleared!");
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
  if (storedCart.some(item => item.id === selectedProduct.id)) {
    alert("This product is already in your cart.");
    return;
  }

  storedCart.push({
    id: selectedProduct.id,
    title: selectedProduct.title,
    price: selectedProduct.priceNew,
    image: selectedProduct.image,
    category: selectedProduct.category,
    features: selectedProduct.features,
    inStock: selectedProduct.inStock
  });

  updateCartUI(storedCart);
};



const updateCartTotal = () => {
  const prices = document.querySelectorAll(".cart-item-price");
  let total = 0;

  prices.forEach(priceEl => {
    const price = parseFloat(priceEl.dataset.price);
    if (!isNaN(price)) total += price;
  });

  document.getElementById("cart-total").textContent = `$${total.toFixed(2)}`;
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
  const productData = products.find(p => p.id === id);
  if (!productData) {
    console.error("Product not found:", id);
    return;
  }

  imgList = Array.isArray(productData.imagelists) ? productData.imagelists : [productData.image];
  console.log(imgList);
  currentImageIndex = 0;

  // ✅ Preload images before displaying
  imgList.forEach(url => {
    const preload = new Image();
    preload.src = url;
  });

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
            <h3>$${productData.priceNew}</h3>
            <button class="btn" data-id="${productData.id}">
              <span>Add To Cart</span>
              <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>
            <div class="artwork-badge">
              Limited Edition
            </div>
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
  productContainer.innerHTML = "";

  productList.forEach(product => {
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
            <span class="old">ETB ${product.priceOld}</span>
            <span class="new">ETB ${product.priceNew}</span>
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
  // Optional: validate cart is not empty
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  if (cartItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Redirect to the checkout page
  window.location.href = "./checkout page/checkout.html";
}

// Initialize
