import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { getRequiredEnv } from "../utils/getRequiredEnv.js";

const connectionString = getRequiredEnv("DATABASE_URL");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
