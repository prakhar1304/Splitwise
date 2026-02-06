import { Router } from "express";
import {
    createExpense,
    getAllExpenses,
    getBalances
} from "../controller/expenses.controller.js";

const router = Router();

router.route("/").post(createExpense).get(getAllExpenses);
router.route("/balances").get(getBalances);

export default router;
