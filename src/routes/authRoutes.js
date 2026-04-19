import express from "express";
import authControllers from "../controllers/authControllers.js";
import { authToken } from "../middlewares/authMiddlewares.js";

const routes = express.Router();

routes.post("/register", authControllers.register.bind(authControllers));
routes.post("/login", authControllers.login.bind(authControllers));
routes.get("/me", authToken, authControllers.getUser.bind(authControllers));

export default routes;
