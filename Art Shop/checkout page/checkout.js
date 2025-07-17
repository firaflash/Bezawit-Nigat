// Load cart data from localStorage
const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

// Get checkout table body
const checkoutTable = document.getElementById("cart-items");
let subtotal = 0;

// Loop through each item and add it to the table
cartItems.forEach(item => {
  // Skip items not in stock
  if (!item.inStock) return;

  const row = document.createElement("li");
  row.innerHTML = `
    <img src="${item.image}" alt="Artwork Thumbnail" class="cart-item-img">
    <div class="cart-item-info">
      <div class="cart-item-title">${item.title}</div>
      <div class="cart-item-price">ETB ${item.price}</div>
    </div>
    <button class="cart-item-remove" onclick="removeItem(this)">✖</button>
  `;
  checkoutTable.appendChild(row);
  subtotal += item.price;
});

// Calculate total
const total = subtotal.toFixed(2);

// Display total
document.getElementById("total-amount").textContent = `$${total}`;

// Payment Method Change Handler
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
  radio.addEventListener('change', function () {
    // Hide all payment detail sections by default
    document.querySelectorAll('.payment-details').forEach(el => el.style.display = 'none');
    document.getElementById('pickup-warning').style.display = 'none';
    document.getElementById('pickup-info').style.display = 'none';

    // Show correct section
    if (this.value === 'bank-transfer') {
      document.getElementById('bank-details').style.display = 'block';
      showPersonalInfo(true);

    } else if (this.value === 'pickup') {
      document.getElementById('pickup-warning').style.display = 'block';
      document.getElementById('pickup-info').style.display = 'block';
      showPersonalInfo(false);
    }
  });
});

function showPersonalInfo(show) {
  const personalElements = document.querySelectorAll(
    '#personal-info, .form-group, .pay-btn , .name-fields'
  );

  personalElements.forEach(el => {
    if (el.id !== 'total' && el.id !== 'btn-spinner') {
      el.style.display = show ? 'block' : 'none';
    }
  });
}


function copyEmail(email) {
  navigator.clipboard.writeText(email).then(() => {
    const msg = document.getElementById("copied-message");
    msg.classList.add("show");

    setTimeout(() => {
      msg.classList.remove("show");
    }, 1500);
  }).catch(err => {
    alert("Failed to copy.");
  });
}

document.getElementById("copy-account-btn").addEventListener("click", function () {
  const accountNumber = document.getElementById("copy-account").textContent;
  navigator.clipboard.writeText(accountNumber).then(() => {
    const status = document.getElementById("copy-status");
    status.classList.add("show");

    setTimeout(() => {
      status.classList.remove("show");
    }, 1500);
  }).catch(err => {
    alert("Failed to copy account number.");
  });
});

// Remove item from cart
function removeItem(btn) {
  const item = btn.closest("li");
  if (item) {
    const title = item.querySelector(".cart-item-title").textContent;

    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems = cartItems.filter(i => i.title !== title);
    localStorage.setItem("cart", JSON.stringify(cartItems));

    item.remove();
    updateTotals();
  }
}

// Update total amounts after item removal
function updateTotals() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = 0;

  cartItems.forEach(item => {
    if (item.inStock) subtotal += item.price;
  });

  const total = subtotal.toFixed(2);
  document.getElementById("total-amount").textContent = `$${total}`;
}

// Form validation for payment methods
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