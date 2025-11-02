import { Router } from 'express';
import chapaController from '../controllers/chapaController.cjs';

const { proceedPayment, verifyPayment } = chapaController;

const router = Router();

router.post("/ProceedPayment", proceedPayment);
router.post("/Verify", verifyPayment);

export default router;
