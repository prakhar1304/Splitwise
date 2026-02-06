import { Router } from "express";
import {
  createExpense,
  getAllExpenses,
  getBalances,
  deleteExpense,
} from "../controller/expenses.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.route("/").post(createExpense).get(getAllExpenses);
router.route("/balances").get(getBalances);
router.route("/:id").delete(deleteExpense);

export default router;
