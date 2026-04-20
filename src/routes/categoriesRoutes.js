import express from "express";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares.js";
import categoriesControllers from "../controllers/categoriesControllers.js";

const routes = express.Router();


routes.post("/", authToken, authAdminOnly, categoriesControllers.createCategory.bind(categoriesControllers));

export default routes;
