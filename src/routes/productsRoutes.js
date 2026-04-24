import express from "express";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares.js";
import productsControllers from "../controllers/productsControllers.js";
import productImagesControllers from "../controllers/productImagesControllers.js";

const routes = express.Router();

routes.get("/", productsControllers.getProducts.bind(productsControllers));
routes.get("/:id", productsControllers.getProductById.bind(productsControllers));
routes.post("/", authToken, authAdminOnly, productsControllers.createProduct.bind(productsControllers));
routes.patch("/update/:id", authToken, authAdminOnly, productsControllers.updateProduct.bind(productsControllers));
routes.delete("/:id", authToken, authAdminOnly, productsControllers.deleteProduct.bind(productsControllers));

routes.get("/:productId/images", productImagesControllers.getImages.bind(productImagesControllers));
routes.post("/:productId/images", authToken, authAdminOnly, productImagesControllers.addImage.bind(productImagesControllers));
routes.delete("/:productId/images/:imageId", authToken, authAdminOnly, productImagesControllers.removeImage.bind(productImagesControllers));

export default routes;
