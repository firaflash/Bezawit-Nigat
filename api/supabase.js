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
export const insertSoldItems = async (cartItems, orderInfo, txRef) => {
  try {
    const rows = cartItems.map(item => ({
      product_id: item.id,
      buyer_name: `${orderInfo.firstName} ${orderInfo.lastName}`,
      buyer_email: orderInfo.email,
      buyer_phone: orderInfo.phoneNumber,
      transaction_id: txRef,
      total_price: item.price,
      currency: orderInfo.selectedCurrency,
      receipt_url: `https://timelessemotions.art/receipt/${txRef}`,
      status: "completed",
    }));

    // Make sure you're using the service_role key for bypassing RLS
    const { data, error } = await supabase
      .from("sold_items")
      .insert(rows)
      .select();

    if (error) {
      console.error("insertSoldItems: Supabase insert error →", error);
      
      // Check if it's an RLS error
      if (error.message.includes('row-level security policy')) {
        return { 
          success: false, 
          error: "RLS policy blocked insert. Check table permissions.",
          details: error.message
        };
      }
      
      return { success: false, error: error.message };
    }

    console.log(`INSERTED → ${rows.length} sold_items record(s) | Tx: ${txRef}`);

    return { 
      success: true, 
      data: data,
      insertedCount: data ? data.length : rows.length
    };

  } catch (err) {
    console.error("insertSoldItems: Unexpected error →", err);
    return { 
      success: false, 
      error: err.message,
      source: "try_catch_exception"
    };
  }
};

export const isPaymentProcessed = async (tx_ref) => {
  try {
    const { data, error } = await supabase
      .from('processed_payments')
      .select('tx_ref')
      .eq('tx_ref', tx_ref)
      .maybeSingle(); // Use maybeSingle() to avoid error if not found

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('isPaymentProcessed: DB error →', error);
      return false;
    }

    return !!data; // true if exists, false if not
  } catch (err) {
    console.error('isPaymentProcessed: Unexpected error →', err);
    return false;
  }
};

// Mark payment as processed (idempotent insert)
export const markPaymentProcessed = async (tx_ref, orderInfo) => {
  try {
    const { error } = await supabase
      .from('processed_payments')
      .upsert(
        {
          tx_ref
        },
        { onConflict: 'tx_ref' } // upserts safely
      );

    if (error) {
      console.error('markPaymentProcessed: Failed →', error.message);
      return false;
    }

    console.log(`Payment marked as processed → ${tx_ref}`);
    return true;
  } catch (err) {
    console.error('markPaymentProcessed: Unexpected error →', err);
    return false;
  }
};