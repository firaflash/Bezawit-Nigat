// checkout.js – TimeLess Emotion (FINAL VERSION – NO CONFLICTS)
let exchangeRates = {};
let selectedCurrency = "USD";
let cartItems = [];

const elements = {
  form: null,
  btnText: null,
  btnSpinner: null
};

window.addEventListener("DOMContentLoaded", () => {
  console.log("Checkout page loaded – DOM ready");

  // Safely get DOM elements
  elements.form = document.getElementById('checkout-form');
  elements.btnText = document.getElementById('btn-text');
  elements.btnSpinner = document.getElementById('btn-spinner');

  if (!elements.form) {
    console.error("Form not found!");
    alert("Page error. Please refresh.");
    return;
  }

  // READ ONLY FROM checkoutPayload (your new system)
  let payload = {};
  try {
    const raw = localStorage.getItem('checkoutPayload');
    if (!raw) throw new Error("No data");
    payload = JSON.parse(raw);
    console.log("Payload loaded:", payload);
  } catch (err) {
    alert("Session expired. Please go back to shop.");
    window.location.href = "../index.html";
    return;
  }

  cartItems = payload.cart || [];
  selectedCurrency = payload.selectedCurrency || "USD";
  exchangeRates = payload.exchangeRates || {};

  if (!cartItems.length) {
    alert("Your cart is empty!");
    window.location.href = "../index.html";
    return;
  }

  console.log(`Found ${cartItems.length} items`);

  // Render UI
  updateCheckoutUI();

  // Attach form submit
  elements.form.addEventListener('submit', handlePayment);
});

// Currency conversion
function convertCurrency(amount, from = "usd", to = selectedCurrency.toLowerCase(), rates = exchangeRates) {
  from = from.toLowerCase();
  to = to.toLowerCase();
  if (!rates[from] || !rates[to]) return amount;
  return (amount / rates[from]) * rates[to];
}

function getSymbol(currency) {
  return currency === "USD" ? "$" : "ETB";
}

// UI RENDERING – CLEAN & NO CONFLICT
function updateCheckoutUI() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("total-amount");

  if (!container || !totalEl) {
    console.error("cart-items or total-amount missing in HTML!");
    return;
  }

  container.innerHTML = "";
  let subtotal = 0;
  const symbol = getSymbol(selectedCurrency);

  cartItems.forEach(item => {
    // Only skip if EXPLICITLY out of stock
    if (item.inStock === false) return;

    const price = convertCurrency(item.price, "usd", selectedCurrency.toLowerCase()) || item.price;
    subtotal += price;

    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${item.image}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">${symbol} ${price.toFixed(2)}</div>
      </div>
      <button class="cart-item-remove">X</button>
    `;
    container.appendChild(li);
  });

  totalEl.textContent = `${symbol} ${subtotal.toFixed(2)}`;
  console.log(`RENDERED: ${symbol} ${subtotal.toFixed(2)}`);
}

// REMOVE ITEM
document.getElementById("cart-items")?.addEventListener("click", (e) => {
  if (e.target.classList.contains("cart-item-remove")) {
    const li = e.target.closest("li");
    const title = li.querySelector(".cart-item-title").textContent;

    cartItems = cartItems.filter(i => i.title !== title);

    // Update payload
    const payload = JSON.parse(localStorage.getItem("checkoutPayload"));
    payload.cartItems = cartItems;
    localStorage.setItem("checkoutPayload", JSON.stringify(payload));

    li.remove();
    updateCheckoutUI();

    if (cartItems.length === 0) {
      alert("Cart is empty!");
      window.location.href = "../index.html";
    }
  }
});

// PAYMENT HANDLER
async function handlePayment(e) {
  e.preventDefault();
  setLoadingState(true);

  try {
    const orderData = prepareOrderData();
    console.log("ORDER →", orderData.total, selectedCurrency);

    const result = await sendPayment(orderData);

    if (result.status === "success") {
      console.log("Redirecting to Chapa →", result.checkoutUrl);
      window.location.href = result.checkoutUrl;
    } else {
      showAlert(result.error || "Payment failed");
    }
  } catch (err) {
    handleError(err);
  } finally {
    setLoadingState(false);
  }
}

async function sendPayment(orderInfo) {
  try {
    const res = await fetch("/api/chapa/ProceedPayment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderInfo })
    });
    const data = await res.json();

    if (data.status === "success" && data.data?.checkout_url) {
      return { status: "success", checkoutUrl: data.data.checkout_url };
    }
    return { status: "error", error: data.error || "Server error" };
  } catch (err) {
    return { status: "error", error: "No internet connection" };
  }
}

function prepareOrderData() {
  const email = document.getElementById('buyer-email')?.value.trim();
  const firstName = document.getElementById('first-name')?.value.trim();
  const lastName = document.getElementById('last-name')?.value.trim();
  const phoneNumber = document.getElementById('phone')?.value.trim();

  if (!email || !firstName || !phoneNumber) {
    throw new Error("Please fill all fields");
  }

  const subtotalUSD = cartItems.reduce((s, i) => s + i.price, 0);
  let total = subtotalUSD;

  if (selectedCurrency.toLowerCase() !== "usd") {
    total = convertCurrency(subtotalUSD, "usd", selectedCurrency.toLowerCase()) || subtotalUSD;
  }

  total = Math.round(total * 100) / 100;

  return {
    email, firstName, lastName, phoneNumber,
    selectedCurrency, cartItems,
    productIds: cartItems.map(i => i.id),
    total, subtotalUSD: +subtotalUSD.toFixed(2)
  };
}

function setLoadingState(loading) {
  elements.btnText.textContent = loading ? "Processing..." : "Complete Order";
  elements.btnSpinner.classList.toggle("hidden", !loading);
}

function showAlert(msg) { alert(msg); }
function handleError(err) {
  console.error("Checkout error:", err);
  showAlert("Error: " + (err.message || "Try again"));
}