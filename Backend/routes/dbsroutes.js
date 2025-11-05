import { Router } from "express";
import { fetchProducts }  from '../controllers/supabase.js';


const router = Router();

router.post("/fetchProduct", fetchProducts);


export default router;