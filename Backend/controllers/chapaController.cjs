require("dotenv").config();

const CHAPA_KEY = process.env.CHAPA_SECRET_KEY;

// Initialize Payment
const proceedPayment = async function (req, res) {
  try {
    const txRef = "chewatatest-" + Date.now();
    const payload = {
      amount: "20.3",
      currency: "ETB",
      email: "muchagraciasfira@gmail.com",
      first_name: "Fira",
      last_name: "Flash",
      phone_number: "0912345678",
      tx_ref: txRef,
      callback_url: "https://hungry-doodles-vanish.loca.lt/api/Chapa/Verify",
      return_url: "http://localhost:5555/",
      "customization[title]": "Payment for favorite merchant",
      "customization[description]": "Online payment test",
    };

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHAPA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Chapa Init:", data);

    if (data.status === "success") {
      res.json(data);
    } else {
      res.status(400).json({ error: "Payment initialization failed", details: data });
    }
  } catch (error) {
    console.error("Error initializing payment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Verify Payment
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
