import express from "express";
import authControllers from "../controllers/authControllers.js";
import { authToken } from "../middlewares/authMiddlewares.js";

const routes = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "Mínimo 8 chars, 1 maiúscula, 1 minúscula, 1 número"
 *                 example: Senha123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */
routes.post("/register", authControllers.register.bind(authControllers));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login e obtenção do token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: Senha123
 *     responses:
 *       200:
 *         description: Login realizado — retorna token JWT
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Email ou senha incorretos
 */
routes.post("/login", authControllers.login.bind(authControllers));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados
 *       401:
 *         description: Token ausente ou inválido
 */
routes.get("/me", authToken, authControllers.getUser.bind(authControllers));

export default routes;
