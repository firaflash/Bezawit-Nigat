import { Router } from 'express';
import chapaController from './chapacontroller.cjs';
// If `chapaController.cjs` is a CommonJS module, import it as the default and
// destructure the exported functions so Node's ESM loader resolves them.
const { proceedPayment, verifyPayment } = chapaController;

const router = Router();

router.post("/proceedpayment", proceedPayment);
router.post("/verify", verifyPayment);

export default router;
