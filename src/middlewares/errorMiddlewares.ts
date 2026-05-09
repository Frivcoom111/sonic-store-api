import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor.";

  if (status >= 500) console.error(err);

  res.status(status).json({ error: message });
};
