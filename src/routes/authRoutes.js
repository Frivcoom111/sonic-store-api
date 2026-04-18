import express from "express";
import authControllers from "../controllers/authControllers.js";
import { authToken } from "../middlewares/authMiddlewares.js";

const routes = express.Router();

routes.post("/register", (req, res, next) => authControllers.register(req, res, next));
routes.post("/login", (req, res, next) => authControllers.login(req, res, next));
routes.get("/me", authToken, (req, res, next) => authControllers.getUser(req, res, next));

export default routes;