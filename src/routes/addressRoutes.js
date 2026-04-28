import express from "express";
import { authToken } from "../middlewares/authMiddlewares.js";
import addressControllers from "../controllers/addressControllers.js";

const routes = express.Router();

routes.get("/", authToken, addressControllers.getAddresses.bind(addressControllers));
routes.get("/:id", authToken, addressControllers.getAddressById.bind(addressControllers));
routes.post("/", authToken, addressControllers.createAddress.bind(addressControllers));
routes.patch("/:id", authToken, addressControllers.updateAddress.bind(addressControllers));
routes.delete("/:id", authToken, addressControllers.deleteAddress.bind(addressControllers));

export default routes;
