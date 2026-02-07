import express from "express";
import cors from "cors";
import expenseRouter from "./router/expenses.router.js";
import userRouter from "./router/user.router.js";
import groupRouter from "./router/group.router.js";
import { authenticateUser } from "./middleware/auth.middleware.js";
import { getAnalytics } from "./controller/expenses.controller.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
// Mount analytics BEFORE expenses router so /analytics is not matched by /:id
app.get("/api/expenses/analytics", authenticateUser, getAnalytics);
app.use("/api/expenses", expenseRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors?.length && { errors: err.errors }),
  });
});

export { app };
