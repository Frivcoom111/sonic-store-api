import express from "express";
import cartControllers from "../controllers/cartControllers.js";
import { authToken } from "../middlewares/authMiddlewares.js";

const routes = express.Router();

routes.get("/", authToken, cartControllers.getCart.bind(cartControllers));
routes.post("/", authToken, cartControllers.addItem.bind(cartControllers));
routes.patch("/:productId", authToken, cartControllers.updateItem.bind(cartControllers));
routes.delete("/:productId", authToken, cartControllers.removeItem.bind(cartControllers));
routes.delete("/", authToken, cartControllers.clearCart.bind(cartControllers));

export default routes;
