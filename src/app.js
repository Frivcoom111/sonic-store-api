import express from "express";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/authRoutes.js"

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

export default app;
