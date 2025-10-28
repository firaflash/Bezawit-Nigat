const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
const checkoutTable = document.getElementById("cart-items");
let subtotal = 0;
let exchangerate = {};
let selectedCurrency;

window.addEventListener("DOMContentLoaded", () => {
  console.log("load window");
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const currencyData = JSON.parse(localStorage.getItem("selectedCurrency")) || { selectedCurrency: "USD", exchangeRates: {} };

  selectedCurrency = currencyData.selectedCurrency;
  exchangerate = currencyData.exchangeRates;

  console.log("🪙 Checkout Currency:", selectedCurrency);
  if (cartItems) {
    console.log(cartItems);
    console.log(cartItems[0].price);
  }
  updateCheckoutUI(cartItems, selectedCurrency);
});

function convertCurrency(amount, from, to) {
  if (!exchangerate[from] || !exchangerate[to]) {
    console.error("Missing currency rate(s)");
    console.log(exchangerate.USD);
    return null;
  }

  const amountInUSD = amount / exchangerate[from];
  const converted = amountInUSD * exchangerate[to];
  return converted;
}

const getCurrencySymbol = (currency) => {
  switch (currency) {
    case "USD": return "$";
    case "ETB": return "ETB";
    case "EUR": return "€";
    case "GBP": return "£";
    default: return currency;
  }
};

function updateCheckoutUI(cartItems, selectedCurrency) {
  const checkoutTable = document.getElementById("cart-items");
  checkoutTable.innerHTML = "";
  let subtotal = 0;

  const symbol = getCurrencySymbol(selectedCurrency);

  cartItems.forEach(item => {
    if (!item.inStock) return;
    console.log("Print price");
    const prices = item.price;
    console.log(prices);
    const converted = convertCurrency(prices, "USD", selectedCurrency);

    const row = document.createElement("li");
    row.innerHTML = `
      <img src="${item.image}" alt="Artwork Thumbnail" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">${symbol} ${converted.toFixed(2)}</div>
      </div>
      <button class="cart-item-remove" onclick="removeItem(this)">✖</button>
    `;
    checkoutTable.appendChild(row);

    subtotal += converted;
  });

  document.getElementById("total-amount").textContent = `${symbol} ${subtotal.toFixed(2)}`;
}

function handlePaymentMethodChange() {
  document.querySelectorAll('.payment-details').forEach(el => el.style.display = 'none');
  document.getElementById('pickup-warning').style.display = 'none';
  document.getElementById('pickup-info').style.display = 'none';

  if (this.value === 'bank-transfer') {
    document.getElementById('bank-details').style.display = 'block';
    showPersonalInfo(true);
  } else if (this.value === 'pickup') {
    document.getElementById('pickup-warning').style.display = 'block';
    document.getElementById('pickup-info').style.display = 'block';
    showPersonalInfo(false);
  }
}

document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
  radio.addEventListener('change', handlePaymentMethodChange);
});

function showPersonalInfo(show) {
  const personalElements = document.querySelectorAll(
    '#personal-info, .form-group, .pay-btn, .name-fields'
  );

  personalElements.forEach(el => {
    if (el.id !== 'total' && el.id !== 'btn-spinner') {
      el.style.display = show ? 'block' : 'none';
    }
  });
}

function copyToClipboard(text, successElement) {
  navigator.clipboard.writeText(text).then(() => {
    const msg = document.getElementById(successElement);
    msg.classList.add("show");

    setTimeout(() => {
      msg.classList.remove("show");
    }, 1500);
  }).catch(err => {
    alert("Failed to copy.");
  });
}

function copyEmail(email) {
  copyToClipboard(email, "copied-message");
}

document.getElementById("copy-account-btn").addEventListener("click", function() {
  const accountNumber = document.getElementById("copy-account").textContent;
  copyToClipboard(accountNumber, "copy-status");
});

document.getElementById("cart-items").addEventListener("click", (e) => {
  if (e.target.classList.contains("cart-item-remove")) {
    const btn = e.target;
    const item = btn.closest("li");
    const title = item.querySelector(".cart-item-title").textContent;

    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems = cartItems.filter(i => i.title !== title);
    localStorage.setItem("cart", JSON.stringify(cartItems));

    item.remove();
    updateTotals();
  }
});

function updateTotals() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const selectedCurrency = localStorage.getItem("selectedCurrency") || "USD";
  const symbol = getCurrencySymbol(selectedCurrency);
  let subtotal = 0;

  cartItems.forEach(item => {
    if (item.inStock) subtotal += convertCurrency(item.price, "USD", selectedCurrency);
  });

  document.getElementById("total-amount").textContent = `${symbol} ${subtotal.toFixed(2)}`;
}

function handlePayment(event) {
  event.preventDefault();

  const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

  if (paymentMethod === 'pickup') {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const outOfStockItems = cartItems.filter(item => !item.inStock);

    if (outOfStockItems.length > 0) {
      alert(`Warning: ${outOfStockItems.length} item(s) in your cart are currently out of stock and may not be available for pickup.`);
    }
  }

  alert('Order submitted successfully!');
}