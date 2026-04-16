import express from "express";
import prisma from "./lib/prisma.js";

const app = express();
app.use(express.json());



export default app;
