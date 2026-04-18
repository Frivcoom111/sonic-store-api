import "dotenv/config";

export const getRequiredEnv = (name) => {
    const value = process.env[name];    

    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`Missing or empty required environment variable: ${name}`);
    }

    return value;
}