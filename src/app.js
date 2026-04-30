import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import { errorMiddlware } from "./middlewares/errorMiddlewares.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/addresses", addressRoutes);

// Usado para captura de errors e retornar em JSON ao invés de HTML assim como o Express retorna.
app.use(errorMiddlware); // ← sempre o ÚLTIMO

export default app;
