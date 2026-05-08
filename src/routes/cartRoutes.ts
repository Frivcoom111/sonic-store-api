import express from "express";
import cartControllers from "../controllers/cartControllers.js";
import { authToken } from "../middlewares/authMiddlewares.js";

const routes = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Ver carrinho do usuário autenticado
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho retornado (vazio ou com itens)
 *       401:
 *         description: Não autenticado
 */
routes.get("/", authToken, cartControllers.getCart.bind(cartControllers));

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Adicionar item ao carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item adicionado — retorna carrinho atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Produto não encontrado
 *       409:
 *         description: Estoque insuficiente ou quantidade igual à atual
 */
routes.post("/", authToken, cartControllers.addItem.bind(cartControllers));

/**
 * @swagger
 * /cart/{productId}:
 *   patch:
 *     summary: Atualizar quantidade de item no carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto no carrinho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantidade atualizada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Item ou produto não encontrado
 *       409:
 *         description: Estoque insuficiente
 */
routes.patch("/:productId", authToken, cartControllers.updateItem.bind(cartControllers));

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Remover item do carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto a remover
 *     responses:
 *       200:
 *         description: Item removido — retorna carrinho atualizado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Item não encontrado no carrinho
 */
routes.delete("/:productId", authToken, cartControllers.removeItem.bind(cartControllers));

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Esvaziar carrinho
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho esvaziado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Carrinho não encontrado
 */
routes.delete("/", authToken, cartControllers.clearCart.bind(cartControllers));

export default routes;
