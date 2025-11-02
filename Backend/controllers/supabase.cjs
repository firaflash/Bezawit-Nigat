import { supabase } from "./supabaseclient.cjs";

const supabaseKey = process.env.SUPABASE_KEY;

const fetchPtoducts = async (req , res )=>{
    const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
    console.log('Loaded artworks:', data);

    if(!data || data != undefined){
        res.send("Error No Product Avaliable");
    }

}

const sellProduct = async (req , res) =>{

}


module.exports = { fetchPtoducts, sellProduct };
