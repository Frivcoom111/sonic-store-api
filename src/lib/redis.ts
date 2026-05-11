import Redis from "ioredis";
import { getRequiredEnv } from "../utils/getRequiredEnv";

const redis = new Redis({
    port: 6379,
    host: "redis",
    password: getRequiredEnv("REDIS_PASSWORD"),
    db: 0
});

export default redis;