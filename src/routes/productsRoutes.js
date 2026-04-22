import express from "express";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares.js";
import productsControllers from "../controllers/productsControllers.js";

const routes = express.Router();

routes.get("/", productsControllers.getProducts.bind(productsControllers));
routes.get("/:id", productsControllers.getProductById.bind(productsControllers));
routes.post("/", authToken, authAdminOnly, productsControllers.createProduct.bind(productsControllers));
routes.patch("/update/:id", authToken, authAdminOnly, productsControllers.updateProduct.bind(productsControllers));
routes.delete("/:id", authToken, authAdminOnly, productsControllers.deleteProduct.bind(productsControllers));

export default routes;
