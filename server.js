import "dotenv/config";
import app from "./src/app.js";
import { getRequiredEnv } from "./src/utils/getRequiredEnv.js"; 

const PORT = parseInt(getRequiredEnv("PORT")) ?? 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
