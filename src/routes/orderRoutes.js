import express from "express";
import orderControllers from "../controllers/orderControllers.js";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares.js";

const routes = express.Router();

routes.post("/", authToken, orderControllers.createOrder.bind(orderControllers));
routes.get("/", authToken, orderControllers.getOrders.bind(orderControllers));
routes.get("/:id", authToken, orderControllers.getOrderById.bind(orderControllers));
routes.patch("/:id/status", authToken, authAdminOnly, orderControllers.updateOrderStatus.bind(orderControllers));
routes.delete("/:id", authToken, orderControllers.cancelOrder.bind(orderControllers));

export default routes;