import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Sonic Store API",
    version,
    description: "API de e-commerce da Sonic Store",
  },
  servers: [
    { url: "http://localhost:3000", description: "Desenvolvimento" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT obtido em POST /auth/login",
      },
    },
  },
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js"],
};
