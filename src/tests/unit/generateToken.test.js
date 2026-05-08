import { getRequiredEnv } from "../../utils/getRequiredEnv.js";
import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

// Simula a variável de ambiente antes de importar
beforeAll(() => {
  process.env.JWT_SECRET = getRequiredEnv("JWT_SECRET");
  process.env.JWT_EXPIRES_IN = getRequiredEnv("JWT_EXPIRES_IN");
});

// Import dinâmico porque depende do env
const { generateToken } = await import("../../utils/generateToken.js");

describe("generateToken", () => {
  it("gera um token JWT válido", () => {
    const user = { id: "uuid-test-1", role: "USER", isActive: true };
    const token = generateToken(user);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("o token contém o id do usuário", () => {
    const user = { id: "550e8400-e29b-41d4-a716-446655440000", role: "USER", isActive: true };
    const token = generateToken(user);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});
