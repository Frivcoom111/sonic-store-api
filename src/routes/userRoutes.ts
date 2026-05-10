import express from "express";
import { authAdminOnly, authToken } from "../middlewares/authMiddlewares";
import userControllers from "../controllers/userControllers";

const routes = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
routes.get("/", authToken, authAdminOnly, userControllers.getUsers.bind(userControllers));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Criar usuário (admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Ana Lima
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@email.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Senha123
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: USER
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Email já cadastrado
 */
routes.post("/", authToken, authAdminOnly, userControllers.createUser.bind(userControllers));

/**
 * @swagger
 * /users/update/me:
 *   patch:
 *     summary: Atualizar dados do próprio perfil
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
routes.patch("/update/me", authToken, userControllers.updateUser.bind(userControllers));

/**
 * @swagger
 * /users/update/password:
 *   patch:
 *     summary: Alterar senha do próprio usuário
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: SenhaAntiga1
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: "Mínimo 8 chars, 1 maiúscula, 1 minúscula, 1 número"
 *                 example: NovaSenha2
 *     responses:
 *       200:
 *         description: Senha alterada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha atual incorreta ou token inválido
 */
routes.patch("/update/password", authToken, userControllers.updateUserPassword.bind(userControllers));

/**
 * @swagger
 * /users/update/{id}/role:
 *   patch:
 *     summary: Alterar role de um usuário
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Role atualizado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
routes.patch("/update/:id/role", authToken, authAdminOnly, userControllers.updateUserRole.bind(userControllers));

/**
 * @swagger
 * /users/toggle/{id}:
 *   patch:
 *     summary: Ativar/desativar usuário
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Status do usuário alternado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
routes.patch("/toggle/:id", authToken, authAdminOnly, userControllers.toggle.bind(userControllers));

export default routes;
