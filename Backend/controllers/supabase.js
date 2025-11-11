// supabase.js
import { supabase } from "./supabaseclient.js";

export const fetchProducts = async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error || !data || data.length === 0) {
    return res.status(404).send("Error: No Product Available");
  }

  res.json(data);
};

export const sellProduct = async (cartItems) => {
  try {
    const productIds = cartItems
      .map(item => (item.id ? parseInt(item.id, 10) : null))
      .filter(id => id !== null && !isNaN(id));

    if (productIds.length === 0) {
      console.warn("sellProduct: No valid product IDs in cartItems");
      return { success: false, error: "No valid product IDs provided" };
    }

    const { data, error } = await supabase
      .from("products")
      .update({ inStock: false })
      .in("id", productIds)
      .select();

    if (error) {
      console.error("sellProduct: Supabase update failed →", error.message);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn(`sellProduct: No products updated for IDs [${productIds.join(", ")}] – already sold or not found`);
      return { success: false, error: "No products updated (already sold or ID mismatch)" };
    }

    // ONLY SUCCESS LOG – this is the one you want to see every time a sale happens
    console.log(`SOLD → ${data.length} artwork(s) marked out of stock | IDs: [${productIds.join(", ")}] | Tx: ${Date.now()}`);

    return { success: true, updated: productIds, count: data.length };
  } catch (err) {
    console.error("sellProduct: Unexpected error →", err);
    return { success: false, error: err.message };
  }
};

export const recordSoldItem = async ({
    productId,
    buyerName,
    buyerEmail,
    buyerPhone = null,
    transactionId = null,
    totalPrice,
    currency = "ETB",
    receiptUrl = null
  }) => {
    if (!productId || !buyerName || !buyerEmail || !totalPrice) {
      return { success: false, error: "Missing required fields" };
    }

    try {
      const { data, error } = await supabase
        .from("sold_items")
        .insert({
          product_id: parseInt(productId, 10),
          buyer_name: buyerName.trim(),
          buyer_email: buyerEmail.trim(),
          buyer_phone: buyerPhone?.trim() || null,
          transaction_id: transactionId || `TXN_${Date.now()}_${productId}`,
          total_price: parseFloat(totalPrice),
          currency: currency.toUpperCase(),
          receipt_url: receiptUrl || null,
          status: "completed",
          sale_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`SALE RECORDED → "${data.buyer_name}" bought artwork #${data.product_id} | ${data.total_price} ${data.currency} | Addis Ababa Time: ${new Date().toLocaleString("en-ET", { timeZone: "Africa/Addis_Ababa" })}`);

      return {
        success: true,
        saleId: data.id,
        message: "Sale recorded forever in TimeLess Emotions history"
      };

    } catch (err) {
      console.error("recordSoldItem failed:", err);
      return { success: false, error: err.message };
    }
};