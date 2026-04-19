import express from "express";
import { authAdminOnly, authToken } from "../middlewares/authMiddlewares.js";
import userControllers from "../controllers/userControllers.js";

const routes = express.Router();

routes.post("/", authToken, authAdminOnly, userControllers.createUser.bind(userControllers));
routes.patch("/update/me", authToken, userControllers.updateUser.bind(userControllers));
routes.patch("/update/password", authToken, userControllers.updateUserPassword.bind(userControllers));
routes.patch("/update/:id/role", authToken, authAdminOnly, userControllers.updateUserRole.bind(userControllers));
routes.patch("/toggle/:id", authToken, authAdminOnly, userControllers.toggle.bind(userControllers));


export default routes;
