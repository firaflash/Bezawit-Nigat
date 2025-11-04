import { Router } from "express";
import { fetchProducts , sellProduct }  from './supabase.js';


const router = Router();

router.post("/fetchProduct", fetchProducts);
router.post("/sellProduct", sellProduct);


export default router;