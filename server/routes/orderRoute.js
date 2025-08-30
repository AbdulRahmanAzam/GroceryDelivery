import express from "express";
import { authUser } from "../middlewares/authUser.js";
import { getAllOrders, getUserOrders, placOrderCOD, placOrderStripe } from "../controllers/orderController.js";
import authSeller from "../middlewares/authSeller.js";

const orderRouter = express.Router();

orderRouter.post("/cod", authUser, placOrderCOD);
orderRouter.get("/user", authUser, getUserOrders);
orderRouter.get("/seller", authSeller, getAllOrders);
orderRouter.post("/stripe", authUser, placOrderStripe);

export default orderRouter;