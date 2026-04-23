# Define a imagem que vamos utilizar.
FROM node:20-alpine

# 
WORKDIR /app
COPY package*.json ./
RUN npm install