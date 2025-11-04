import { supabase } from "./supabaseclient.js";

export const fetchProducts = async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");

  if (error || !data || data.length === 0) {
    return res.status(404).send("Error: No Product Available");
  }

  res.json(data);
};

export const sellProduct = async (req, res) => {
  // implement later
};
