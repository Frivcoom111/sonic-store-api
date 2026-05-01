import express from "express";
import { authToken } from "../middlewares/authMiddlewares.js";
import addressControllers from "../controllers/addressControllers.js";

const routes = express.Router();

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Listar endereços do usuário autenticado
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de endereços
 *       401:
 *         description: Não autenticado
 */
routes.get("/", authToken, addressControllers.getAddresses.bind(addressControllers));

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Buscar endereço por ID
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Endereço encontrado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Endereço não encontrado
 */
routes.get("/:id", authToken, addressControllers.getAddressById.bind(addressControllers));

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Criar endereço
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, number, city, state, zipCode]
 *             properties:
 *               street:
 *                 type: string
 *                 maxLength: 100
 *                 example: Rua das Flores
 *               number:
 *                 type: integer
 *                 minimum: 1
 *                 example: 123
 *               complement:
 *                 type: string
 *                 maxLength: 100
 *                 example: Apto 45
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 pattern: "^[A-Z]{2}$"
 *                 example: SP
 *               zipCode:
 *                 type: string
 *                 pattern: "^\\d{5}-\\d{3}$"
 *                 example: 01310-100
 *     responses:
 *       201:
 *         description: Endereço criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
routes.post("/", authToken, addressControllers.createAddress.bind(addressControllers));

/**
 * @swagger
 * /addresses/{id}:
 *   patch:
 *     summary: Atualizar endereço
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do endereço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 maxLength: 100
 *               number:
 *                 type: integer
 *                 minimum: 1
 *               complement:
 *                 type: string
 *                 maxLength: 100
 *               city:
 *                 type: string
 *                 maxLength: 100
 *               state:
 *                 type: string
 *                 pattern: "^[A-Z]{2}$"
 *               zipCode:
 *                 type: string
 *                 pattern: "^\\d{5}-\\d{3}$"
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Endereço não encontrado
 */
routes.patch("/:id", authToken, addressControllers.updateAddress.bind(addressControllers));

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Deletar endereço
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Endereço deletado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Endereço não encontrado
 */
routes.delete("/:id", authToken, addressControllers.deleteAddress.bind(addressControllers));

export default routes;
