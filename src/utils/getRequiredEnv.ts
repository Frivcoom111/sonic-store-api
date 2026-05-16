export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or empty required environment variable: ${name}`);
  }

  return value;
}
