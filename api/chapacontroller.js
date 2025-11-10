import dotenv from "dotenv";
import { sellProduct } from "./supabase.js"; // (for later use)
import { sendConfirmationEmail } from "./emailjs.js";

dotenv.config();

const CHAPA_KEY = process.env.CHAPA_SECRET_KEY;

// Temporary storage for pending order info
const pendingOrders = new Map();

// Initialize Payment
export const proceedPayment = async (req, res) => {
  try {
    const txRef = `TIMLSS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // console.log("Received orderInfo:", req.body);

    const orderInfo = req.body.orderInfo;
    console.log(orderInfo.cartItems);

    // Save this order so we can use it later during verification
    pendingOrders.set(txRef, orderInfo);

    const payload = {
      amount: orderInfo.total,
      currency: orderInfo.selectedCurrency,
      email: orderInfo.email,
      first_name: orderInfo.firstName,
      last_name: orderInfo.lastName,
      phone_number: orderInfo.phoneNumber,
      tx_ref: txRef,
      callback_url: "https://bezawit-nigat.vercel.app/api/chapa/Verify",
      return_url: "https://bezawit-nigat.vercel.app/artShop/index.html",
      customization: {
        title: "TimeLess Emotion",
        description: "Art Purchase",
        logo:
          "https://res.cloudinary.com/dvdmhurvt/image/upload/v1762345498/WhiteTLLogo_qsxota.png",
      },
    };

    console.log("Payload sent to Chapa:", payload);

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Chapa Init Response:", data);

    if (data.status === "success") {
      res.json({ ...data, tx_ref: txRef }); // include tx_ref for tracking
    } else {
      res.status(400).json({
        error: "Payment initialization failed",
        details: data,
      });
    }
  } catch (error) {
    console.error("Error initializing payment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    console.log("Verifying callback...");
    const { tx_ref } = req.body;

    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CHAPA_KEY}`,
      },
    });

    const data = await response.json();
    console.log("Verification:", data);

    if (data.status === "success" && data.data.status === "success") {
      console.log("✅ Payment verified successfully!");

      // Retrieve stored order info for this transaction
      const orderInfo = pendingOrders.get(tx_ref);

      
        // Prepare email template params
        const templateParams = {
          full_name: `${orderInfo.firstName} ${orderInfo.lastName}`,
          email: orderInfo.email,
          transaction_id: tx_ref,
          order_date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          total_price: orderInfo.total,
          logo_url:
            "https://res.cloudinary.com/dvdmhurvt/image/upload/v1762345498/WhiteTLLogo_qsxota.png",
          receipt_url: `https://timelessemotions.art/receipt/${tx_ref}`,
          support_phone: "+251 912 345 678",
          website_url: "https://timelessemotions.art",
          year: new Date().getFullYear(),
          products: orderInfo.cartItems.map((item) => ({
            title: item.title,
            category: item.category,
            priceNew: item.price.toFixed(2),
            image: item.image,
          })),
          currency: orderInfo.selectedCurrency
        };
        console.log("From the Chapa Controller ",templateParams);

        // Send confirmation email
        await sendConfirmationEmail(templateParams);
        console.log("📧 Email sent successfully to:", orderInfo.email);

        // Remove from temporary store
        pendingOrders.delete(tx_ref);

        // (Later) Call sellProduct() to update DB
        // await sellProduct(orderInfo);
      
        console.warn("⚠️ No order info found for tx_ref:", tx_ref);
      
    } else {
      console.log("❌ Payment not successful:", data.data.status);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
};
