import { Router } from "express";
import { proceedPayment, verifyPayment } from "../controllers/chapaController.js";

const router = Router();

router.post("/ProceedPayment", proceedPayment);
router.post("/Verify", verifyPayment);

export default router;
