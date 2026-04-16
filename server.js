import app from "./src/app.js";
import "dotenv/config"
import prisma from "./src/lib/prisma.js";

const PORT = process.env.PORT;

const teste = await prisma.user.findMany()
console.log("Conexão OK:", teste)

app.listen(PORT, () => {
    console.log(`Servidor rodando: ${PORT}`);
})