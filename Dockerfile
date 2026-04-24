
# Definindo qual a versão do node.js
FROM node:24-alpine

# Qual a pasta que o Docker vai trabalhar
WORKDIR /app

# Pegando as dependências do package.json
COPY package*.json ./
COPY prisma ./prisma

# Instalando todas as dependências do projeto
RUN npm ci
RUN npx prisma generate

COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

