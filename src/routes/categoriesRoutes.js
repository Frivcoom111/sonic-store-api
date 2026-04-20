import express from "express";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares.js";
import categoriesControllers from "../controllers/categoriesControllers.js";

const routes = express.Router();

routes.get("/", categoriesControllers.getCategories.bind(categoriesControllers));
routes.post("/", authToken, authAdminOnly, categoriesControllers.createCategory.bind(categoriesControllers));
routes.patch("/update/:id", authToken, authAdminOnly, categoriesControllers.updatedCategory.bind(categoriesControllers));
routes.delete("/:id", authToken, authAdminOnly, categoriesControllers.deleteCategory.bind(categoriesControllers));

export default routes;
