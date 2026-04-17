import express from "express";
import authControllers from "../controllers/authControllers";

const routes = express.Router();

routes.post("/register", (req, res, next) => authControllers.register(req, res, next));

export default routes;