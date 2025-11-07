const elements = {
  form: document.getElementById('checkout-form'),
  btnText: document.getElementById('btn-text'),
  btnSpinner: document.getElementById('btn-spinner')
};

elements.form.addEventListener('submit', handleBankTransferVerification);

async function handleBankTransferVerification(e) {
  e.preventDefault();
  setLoadingState(true);

  try {
    // 1. Validate form
    if (!validateForm()) return;
    const orderData = prepareOrderData();

    const paymentResult = await sendPayment(orderData);

    if (paymentResult.status !== 'success') {
      alert(paymentResult.error || 'Payment initiation failed.');
      return;
    }

    window.location.href = paymentResult.checkoutUrl;
    // sendConfirmationEmail(orderData).catch(console.warn);
    handleSuccess();

  } catch (error) {
    handleError(error);
  } finally {
    setLoadingState(false);
  }
}
async function sendPayment(orderInfo) {
  try {
    const response = await fetch('/api/Chapa/ProceedPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderInfo }),
    });

    const data = await response.json();

    // Success: backend returned checkout URL
    if (data.status === 'success' && data.data?.checkout_url) {
      return {
        status: 'success',
        checkoutUrl: data.data.checkout_url,
      };
    }

    // Backend error
    return {
      status: 'error',
      error: data.error || data.message || 'Unknown error from server',
    };

  } catch (err) {
    console.error('Payment request failed:', err);
    return {
      status: 'error',
      error: 'Network error. Please check your connection and try again.',
    };
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
  // ---- user fields ----
  const email      = document.getElementById('buyer-email').value.trim();
  const firstName  = document.getElementById('first-name').value.trim();
  const lastName   = document.getElementById('last-name').value.trim();
  const phoneNumber= document.getElementById('phone').value.trim();

  // ---- phone validation (unchanged) ----
  const phoneRegex = /^(?:\+\d{1,3}[-.\s]?)?(?:\(\d{1,4}\)[\s.-]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
  const clean = phoneNumber.replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (!phoneRegex.test(phoneNumber) || clean.length < 10) {
    throw new Error('Valid phone required');
  }

  // ---- data from artshop ----
  const payload = JSON.parse(localStorage.getItem('checkoutPayload'));
  const { cart: cartItems, selectedCurrency: Currency, exchangeRates } = payload;

  selectedCurrency = selectedCurrency.toLowerCase();
  

  // ---- USD subtotal (prices are stored in USD) ----
  const subtotalUSD = cartItems.reduce((s, it) => s + +it.price, 0);

  // ---- convert to selected currency ----
  let total = subtotalUSD;
  if (Currency !== 'usd' && exchangeRates.usd && exchangeRates[Currency]) {
    const inUSD = subtotalUSD / exchangeRates.USD;
    total = inUSD * exchangeRates[Currency];
  }
  total = Math.round(total * 100) / 100;   // 2-dp

  return {
    email, firstName, lastName, phoneNumber,
    Currency,
    cartItems,
    productIds: cartItems.map(i => i.id.toString()),
    subtotalUSD: +subtotalUSD.toFixed(2),
    total,                 
    exchangeRates          
  };
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
