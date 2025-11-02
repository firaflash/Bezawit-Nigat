import { Router } from 'express';
import chapaController from './chapaController.cjs';
// If `chapaController.cjs` is a CommonJS module, import it as the default and
// destructure the exported functions so Node's ESM loader resolves them.
const { proceedPayment, verifyPayment } = chapaController;

const router = Router();

router.post("/ProceedPayment", proceedPayment);
router.post("/Verify", verifyPayment);

export default router;
