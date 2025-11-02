require("dotenv").config();

const CHAPA_KEY = process.env.CHAPA_SECRET_KEY;

// Initialize Payment
const proceedPayment = async function (req, res) {
  try {
    const txRef = "chewatatest-" + Date.now();

    console.log("Received orderInfo:", req.body);
    const orderInfo = req.body.orderInfo;

    const payload = {
      amount: orderInfo.total, 
      currency: orderInfo.Currency, 
      email: orderInfo.email,
      first_name: orderInfo.firstName,
      last_name: orderInfo.lastName,
      phone_number: orderInfo.phoneNumber,
      tx_ref: txRef,
      callback_url: `https://bezawit-nigat.vercel.app/api/Chapa/Verify`,
      return_url: `https://bezawit-nigat.vercel.app/ArtShop/artPage.html`,
      customization: {
        title: "TimeLess",
        description: "Online payment test",
        logo:
          "https://euxhwztkmhzyrcwoupne.supabase.co/storage/v1/object/public/public-img/Art%20Shop%20Imgs/Timeless%20Logo.png",
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
    console.log("Chapa Init Response:", data);

    if (data.status === "success") {
      res.json(data);
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

// Verify Payment (NO CHANGES - logic preserved)
const verifyPayment = async function (req, res) {
  try {
    console.log("Verifying callback...");
    const { tx_ref } = req.body;

    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${CHAPA_KEY}`,
      },
    });

    const data = await response.json();
    console.log("Verification:", data);

    if (data.status === "success" && data.data.status === "success") {
      console.log("✅ Payment verified successfully!");
    } else {
      console.log("❌ Payment not successful:", data.data.status);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
}

module.exports = { proceedPayment, verifyPayment };