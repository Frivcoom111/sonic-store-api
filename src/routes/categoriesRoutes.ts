import express from "express";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares";
import categoriesControllers from "../controllers/categoriesControllers";

const routes = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar todas as categorias
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
routes.get("/", categoriesControllers.getCategories.bind(categoriesControllers));

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Criar categoria
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Headphones
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Nome já existe
 */
routes.post("/", authToken, authAdminOnly, categoriesControllers.createCategory.bind(categoriesControllers));

/**
 * @swagger
 * /categories/update/{id}:
 *   patch:
 *     summary: Atualizar categoria
 *     tags: [Categories]
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
 *         description: ID da categoria
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
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Categoria não encontrada
 */
routes.patch("/update/:id", authToken, authAdminOnly, categoriesControllers.updatedCategory.bind(categoriesControllers));

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Deletar categoria
 *     tags: [Categories]
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
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria deletada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Categoria não encontrada
 */
routes.delete("/:id", authToken, authAdminOnly, categoriesControllers.deleteCategory.bind(categoriesControllers));

export default routes;
