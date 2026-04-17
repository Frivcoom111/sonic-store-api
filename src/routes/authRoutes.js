import express from "express";
import authControllers from "../controllers/authControllers.js";

const routes = express.Router();

routes.post("/register", (req, res, next) => authControllers.register(req, res, next));
routes.post("/login", (req, res, next) => authControllers.login(req, res, next));

export default routes;