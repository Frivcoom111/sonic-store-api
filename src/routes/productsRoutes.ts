import express from "express";
import { authToken, authAdminOnly } from "../middlewares/authMiddlewares.js";
import productsControllers from "../controllers/productsControllers.js";
import productImagesControllers from "../controllers/productImagesControllers.js";

const routes = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar produtos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Slug da categoria para filtrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca (nome do produto)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
routes.get("/", productsControllers.getProducts.bind(productsControllers));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Buscar produto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Produto não encontrado
 */
routes.get("/:id", productsControllers.getProductById.bind(productsControllers));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, mark, description, price, stock, imageUrl]
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Sony WH-1000XM5
 *               mark:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Sony
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: Fone over-ear com cancelamento de ruído premium
 *               price:
 *                 type: number
 *                 format: double
 *                 minimum: 0.01
 *                 example: 1899.90
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Produto criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 */
routes.post("/", authToken, authAdminOnly, productsControllers.createProduct.bind(productsControllers));

/**
 * @swagger
 * /products/update/{id}:
 *   patch:
 *     summary: Atualizar produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN. Campos são opcionais (partial update).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               mark:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *               price:
 *                 type: number
 *                 format: double
 *                 minimum: 0.01
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
routes.patch("/update/:id", authToken, authAdminOnly, productsControllers.updateProduct.bind(productsControllers));

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Deletar produto
 *     tags: [Products]
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
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
routes.delete("/:id", authToken, authAdminOnly, productsControllers.deleteProduct.bind(productsControllers));

/**
 * @swagger
 * /products/{productId}/images:
 *   get:
 *     summary: Listar imagens de um produto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Lista de imagens
 *       404:
 *         description: Produto não encontrado
 */
routes.get("/:productId/images", productImagesControllers.getImages.bind(productImagesControllers));

/**
 * @swagger
 * /products/{productId}/images:
 *   post:
 *     summary: Adicionar imagem ao produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image2.jpg
 *     responses:
 *       201:
 *         description: Imagem adicionada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
routes.post("/:productId/images", authToken, authAdminOnly, productImagesControllers.addImage.bind(productImagesControllers));

/**
 * @swagger
 * /products/{productId}/images/{imageId}:
 *   delete:
 *     summary: Remover imagem do produto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Requer role ADMIN
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da imagem
 *     responses:
 *       200:
 *         description: Imagem removida
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Imagem não encontrada
 */
routes.delete("/:productId/images/:imageId", authToken, authAdminOnly, productImagesControllers.removeImage.bind(productImagesControllers));

export default routes;
