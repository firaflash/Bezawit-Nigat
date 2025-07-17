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
  btnSpinner: document.getElementById('btn-spinner'),
  
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
    const receiptUrl = await uploadReceipt(orderData.receiptFile);
    await createSalesRequest({ ...orderData, receiptUrl });
    await sendConfirmationEmail(orderData, receiptUrl);
    
    // Success handling
    handleSuccess();
  } catch (error) {
    handleError(error);
  } finally {
    setLoadingState(false);
  }
}

// Helper functions
function setLoadingState(isLoading) {
  elements.btnText.textContent = isLoading ? 'Processing...' : 'Complete Order';
  elements.btnSpinner.classList.toggle('hidden', !isLoading);
}

function validateForm() {
  const isBankTransfer = document.getElementById('bank-transfer').checked;
  if (!isBankTransfer) {
    showAlert("Only bank transfer is supported right now.", 'warning');
    return false;
  }

  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartItems.length === 0) {
    showAlert("Your cart is empty.", 'warning');
    return false;
  }

  // Add more validations as needed
  return true;
}

function prepareOrderData() {
  const buyer_email = document.getElementById('buyer-email').value.trim();
  const transactionId = document.getElementById('transaction-id').value.trim();
  const receiptFile = document.getElementById('receipt-upload').files[0];
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const fullName = `${firstName} ${lastName}`;
  const phoneNumber = document.getElementById('phone').value.trim();
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const productIds = cartItems.map(item => item.id.toString());
  const subtotal = cartItems.reduce((sum, item) => sum + (item.inStock ? item.price : 0), 0);
  const total = subtotal.toFixed(2);

  return {
    buyer_email,
    transactionId,
    receiptFile,
    fullName,
    phoneNumber,
    cartItems,
    productIds,
    subtotal,
    total
  };
}

async function uploadReceipt(file) {
  try {
    const filePath = `uploads/${Date.now()}_${file.name}`;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a JPEG, PNG, or PDF file');
    }

    const { data, error } = await supabase.storage
      .from(config.storageBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    return supabase.storage
      .from(config.storageBucket)
      .getPublicUrl(data.path).data.publicUrl;
  } catch (error) {
    console.error('Receipt upload failed:', error);
    throw new Error('Receipt upload failed. Please try again.');
  }
}

async function createSalesRequest(orderData) {
  const { error } = await supabase
    .from('sales_requests')
    .insert([{
      email: orderData.buyer_email,
      full_name: orderData.fullName,
      phone_number: orderData.phoneNumber,
      transaction_id: orderData.transactionId,
      receipt_url: orderData.receiptUrl,
      product_ids: orderData.productIds,
      total_price: orderData.total,
      status: 'pending'
    }]);

  if (error) throw error;
}

async function sendConfirmationEmail(orderData, receiptUrl) {
const templateParams = {
    website_url: "https://yourwebsite.com", // Add your website URL
    buyer_name: orderData.fullName,
    buyer_email: orderData.buyer_email,
    order_number: `ORD-${Date.now().toString().slice(-6)}`, // Generate a simple order number
    order_date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    transaction_id: orderData.transactionId,
    receipt_url: receiptUrl,
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
  showAlert("✅ Payment verification submitted and confirmation email sent.", 'success');
  elements.form.reset();
  localStorage.removeItem("cart");
  // Optional: Redirect to confirmation page
}

function handleError(error) {
  console.error('Order processing error:', error);
  const message = error.message || "Something went wrong. Please try again.";
  showAlert(`❌ ${message}`, 'error');
}

function showAlert(message, type = 'info') {
  // Replace with your preferred notification system
  alert(message); 
  // Consider using a proper toast/notification library
}

// Account copy function
document.getElementById('copy-account-btn').addEventListener('click', copyAccountNumber);

async function copyAccountNumber() {
  try {
    const accountNumber = document.getElementById('copy-account').textContent;
    await navigator.clipboard.writeText(accountNumber);
    // showAlert("Account number copied to clipboard!", 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showAlert("❌ Failed to copy account number.", 'error');
  }
}