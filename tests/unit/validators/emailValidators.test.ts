import { describe, it, expect } from "vitest";
import { verifyEmailSchema } from "../../../src/validators/emailValidators";

describe("verifyEmailSchema", () => {
  it("aceita código de 6 dígitos válido", () => {
    const result = verifyEmailSchema.safeParse({ code: 482931 });
    expect(result.success).toBe(true);
  });

  it("rejeita string númerica", () => {
    const result = verifyEmailSchema.safeParse({ code: "482931" });
    expect(result.success).toBe(false);
    if (result.success) expect(result.data.code).toBe(482931);
  });

  it("rejeita código abaixo de 100000", () => {
    const result = verifyEmailSchema.safeParse({ code: 99999 });
    expect(result.success).toBe(false);
  });

  it("rejeita código acima de 999999", () => {
    const result = verifyEmailSchema.safeParse({ code: 1000000 });
    expect(result.success).toBe(false);
  });

  it("rejeita string não numérica", () => {
    const result = verifyEmailSchema.safeParse({ code: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejeita ausência do campo code", () => {
    const result = verifyEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});