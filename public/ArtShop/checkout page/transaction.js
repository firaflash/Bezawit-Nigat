import emailjs from 'https://cdn.skypack.dev/@emailjs/browser';
import { supabase } from '../config/supabaseClient.js';

// Configuration
const config = {
  emailServiceID: 'service_x8sh3ir',
  emailTemplateID: 'template_loov3b9',
  storageBucket: 'receipts',
};

// DOM Elements
const elements = {
  form: document.getElementById('checkout-form'),
  btnText: document.getElementById('btn-text'),
  btnSpinner: document.getElementById('btn-spinner')
};

// Initialize EmailJS
emailjs.init("6ZBoLbxtk8Fcy_CNQ");

// Main form handler
elements.form.addEventListener('submit', handleBankTransferVerification);




async function handleBankTransferVerification(e) {

  e.preventDefault();
  setLoadingState(true);

  try {
    // Validate form
    if (!validateForm()) return;
    
    // Process order
    const orderData = prepareOrderData();
    console.log(orderData);
    await sendConfirmationEmail(orderData);
    await sendPayment(orderData);
    
    handleSuccess();
  } catch (error) {
    handleError(error);
  } finally {
    setLoadingState(false);
  }
}

async function sendPayment(orderInfo) {
  console.log(orderInfo);
  try {
    const response = await fetch('/api/Chapa/ProceedPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderInfo })
    });

    const data = await response.json();
    console.log("Response from backend:", data);

    if (data.status === "success" && data.data.checkout_url) {
      // Redirect user to Chapa checkout
      window.location.href = data.data.checkout_url;
    } else {
      alert('Payment failed: ' + (data.error || data.message));
    }
  } catch (err) {
    console.error("Error occurred:", err);
    alert("Something went wrong. Please try again.");
  }
}




// Helper functions
function setLoadingState(isLoading) {
  elements.btnText.textContent = isLoading ? 'Processing...' : 'Complete Order';
  elements.btnSpinner.classList.toggle('hidden', !isLoading);
}

function validateForm() {


  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartItems.length === 0) {
    showAlert("Your cart is empty.", 'warning');
    return false;
  }
  return true;
}

function prepareOrderData() {
  const email = document.getElementById('buyer-email').value.trim();
  const currencyData = JSON.parse(localStorage.getItem("selectedCurrency")) || { selectedCurrency: "USD", exchangeRates: {} };
  const Currency = currencyData.selectedCurrency;
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const phoneNumber = document.getElementById('phone').value.trim();
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const productIds = cartItems.map(item => item.id.toString());
  const subtotal = cartItems.reduce((sum, item) => sum + (item.inStock ? item.price : 0), 0);
  const total = subtotal.toFixed(2);

  return {
    email,
    Currency,
    firstName,
    lastName,
    phoneNumber,
    cartItems,
    productIds,
    subtotal,
    total
  };
}

async function sendConfirmationEmail(orderData) {
const templateParams = {
    website_url: "https://bezawit-nigat.vercel.app",
    buyer_name: orderData.fullName,
    buyer_email: orderData.email,
    order_number: `ORD-${Date.now().toString().slice(-6)}`, // Generate a simple order number
    order_date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    transaction_id: 'TX-NEW_ID',
    receipt_url: "https://bezawit-nigat.vercel.app/ArtShop/artPage.html",
    products: orderData.cartItems.map(item => ({
      title: item.title,
      price: item.price.toFixed(2)
    })),
    order_total: (parseFloat(orderData.total) || 0).toFixed(2),
    company_address: "123 Business Rd, City, Country" // Add your address
  };
  try {
    const response = await emailjs.send(
      config.emailServiceID, 
      config.emailTemplateID, 
      templateParams
    );
    console.log("Email sent:", response);
  } catch (error) {
    console.error("Email failed to send:", error);
    // Consider whether to throw or continue without email
  }
}

function handleSuccess() {
  localStorage.removeItem("cart");
  showAlert("✅ Payment verification submitted and confirmation email sent.", 'success');
  elements.form.reset();
}

function handleError(error) {
  console.error('Order processing error:', error);
  const message = error.message || "Something went wrong. Please try again.";
  showAlert(`❌ ${message}`, 'error');
}

function showAlert(message, type = 'info') {
  alert(message); 
}
