FROM node:18-alpine

WORKDIR /app

# Configurar npm para melhor conectividade
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-timeout 600000 && \
    npm config set maxsockets 5

# Copiar apenas package.json primeiro para cache otimizado
COPY package.json ./

# Instalar dependências com configurações otimizadas
RUN npm install --silent --progress=false --audit=false --fund=false

# Copiar resto do código
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
