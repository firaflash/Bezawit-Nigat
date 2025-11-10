import { Router } from 'express';
import { proceedPayment, verifyPayment } from './chapacontroller.js';

const router = Router();

router.post("/proceedpayment", proceedPayment);
router.post("/verify", verifyPayment);

export default router;
