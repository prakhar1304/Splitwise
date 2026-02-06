import { Router } from "express";
import {
  createExpense,
  getAllExpenses,
  getExpensesByGroup,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getBalances,
  getBalancesByGroup,
} from "../controller/expenses.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateUser);

router.route("/").post(createExpense).get(getAllExpenses);
router.get("/balances", getBalances);
router.get("/balances/group/:groupId", getBalancesByGroup);
router.get("/group/:groupId", getExpensesByGroup);
router.route("/:id").get(getExpenseById).put(updateExpense).delete(deleteExpense);

export default router;
