import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { errorMiddlware } from "./middlewares/errorMiddlewares.js";

const app = express();
app.use(express.json({ limit: "10kb" }));

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/addresses", addressRoutes);
app.use("/orders", orderRoutes);

// Usado para captura de errors e retornar em JSON ao invés de HTML assim como o Express retorna.
app.use(errorMiddlware); // ← sempre o ÚLTIMO

export default app;
