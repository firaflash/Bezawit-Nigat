import { Router } from "express";
import supabase from '../controllers/supabase.cjs';

const { fetchPtoducts , sellProduct } = supabase;
const router = Router();

router.post("/fetchProduct", proceedPayment);
router.post("/sellProduct", sellProduct);


export default router;