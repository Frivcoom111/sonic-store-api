import express from "express";
import orderControllers from "../controllers/orderControllers.js";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares.js";

const routes = express.Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Criar pedido a partir do carrinho
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: Cria um pedido com os itens do carrinho atual. Decrementa estoque e limpa o carrinho.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId]
 *             properties:
 *               addressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do endereço de entrega (deve pertencer ao usuário)
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Carrinho vazio ou dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Endereço não pertence ao usuário
 *       404:
 *         description: Endereço não encontrado
 *       409:
 *         description: Estoque insuficiente para algum item
 */
routes.post("/", authToken, orderControllers.createOrder.bind(orderControllers));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Listar pedidos
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: Usuário comum vê apenas os próprios pedidos. ADMIN vê todos.
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: Não autenticado
 */
routes.get("/", authToken, orderControllers.getOrders.bind(orderControllers));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Pedido não pertence ao usuário
 *       404:
 *         description: Pedido não encontrado
 */
routes.get("/:id", authToken, orderControllers.getOrderById.bind(orderControllers));

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualizar status do pedido
 *     tags: [Orders]
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
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderStatus]
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELLED]
 *                 example: PAID
 *     responses:
 *       200:
 *         description: Status atualizado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido não encontrado
 */
routes.patch("/:id/status", authToken, authAdminOnly, orderControllers.updateOrderStatus.bind(orderControllers));

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Cancelar pedido
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     description: Cancela pedido com status PENDING. Restaura estoque dos produtos. Owner ou ADMIN.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido cancelado — estoque restaurado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido não encontrado
 *       409:
 *         description: Pedido não está em status PENDING
 */
routes.delete("/:id", authToken, orderControllers.cancelOrder.bind(orderControllers));

export default routes;
