// chapaController.js
import dotenv from "dotenv";
import { sellProduct, insertSoldItems, isPaymentProcessed, markPaymentProcessed } from "./supabase.js";
import { sendConfirmationEmail } from "./emailjs.js";

dotenv.config();
const CHAPA_KEY = process.env.CHAPA_SECRET_KEY;

// In-memory pending orders (tx_ref → orderInfo)
const pendingOrders = new Map();

// Initialize Payment
export const proceedPayment = async (req, res) => {
  try {
    const txRef = `TIMLSS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const orderInfo = req.body.orderInfo;

    // Store order for verification
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
        logo: "https://res.cloudinary.com/dvdmhurvt/image/upload/v1762345498/WhiteTLLogo_qsxota.png",
      },
    };

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status === "success") {
      console.log(`Payment link created → ${txRef} | Amount: ${orderInfo.total} ${orderInfo.selectedCurrency}`);
      res.json({ ...data, tx_ref: txRef });
    } else {
      console.warn(`Chapa init failed → ${txRef}`, data);
      res.status(400).json({ error: "Payment initialization failed", details: data });
    }
  } catch (error) {
    console.error("proceedPayment error →", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.body;
    console.log(req.body);
    


    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CHAPA_KEY}`,
      },
    });

    const data = await response.json();

    if (data.status === "success" && data.data.status === "success") {
      console.log(`Payment verified → ${tx_ref}`);

      const orderInfo = pendingOrders.get(tx_ref);

      if (!orderInfo) {
        console.warn(`No order info found for tx_ref: ${tx_ref}`);
        return res.status(200).json(data); // Still acknowledge Chapa
      }

      // 1. SECURE INVENTORY FIRST
      const sellResult = await sellProduct(orderInfo.cartItems);
      const soldItemsResult = await insertSoldItems(orderInfo.cartItems, orderInfo, tx_ref);


      if (!sellResult.success) {
        console.error(`STOCK UPDATE FAILED → ${tx_ref} | Error: ${sellResult.error}`);
        // Don't block the flow — money is already taken
      } else {
        console.log(`SOLD → ${sellResult.count} artwork(s) | IDs: [${sellResult.updated.join(", ")}] | Tx: ${tx_ref}`);
      }

      

      // 2. SEND CONFIRMATION EMAIL
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
        logo_url: "https://res.cloudinary.com/dvdmhurvt/image/upload/v1762345498/WhiteTLLogo_qsxota.png",
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
        currency: orderInfo.selectedCurrency,
      };

      try {
        await sendConfirmationEmail(templateParams);
        console.log(`Email sent → ${orderInfo.email} | Tx: ${tx_ref}`);
      } catch (emailErr) {
        console.error(`Email failed → ${orderInfo.email} | Tx: ${tx_ref} | Error:`, emailErr);
      }
      if (!soldItemsResult.success) {
        console.error(`INSERT FAILED → sold_items not recorded | Tx: ${tx_ref}`);
      } else {
        console.log(`SOLD ITEMS RECORDED → ${soldItemsResult.data.length} rows | Tx: ${tx_ref}`);
      }

      // Clean up
      pendingOrders.delete(tx_ref);
    } else {
      console.log(`Payment failed → ${tx_ref} | Status: ${data.data?.status}`);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("verifyPayment error →", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
};