import { Router } from "express";
import { recordPayment, getPaymentHistory } from "../controller/settlement.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateUser);

router.post("/", recordPayment);
router.get("/", getPaymentHistory);

export default router;
