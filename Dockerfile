# 1. FAZA Build (Kompajliranje)
FROM node:24-alpine AS builder

# Ovo će ažurirati Alpine sistemske biblioteke na najnovije verzije
RUN apk update && apk upgrade

WORKDIR /app

# Kopiraj fajlove potrebne za instalaciju
COPY package*.json ./
RUN npm install

# Kopiraj cijeli izvorni kod
COPY . .

# Pokreni Nx build za apiserver
RUN npx nx build api-server --prod

# 2. FAZA Runner (Izvršavanje)
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Kopiraj samo produkcione zavisnosti it prve faze (dist folder)
COPY --from=builder /app/dist/apps/api-server ./dist
COPY --from=builder /app/package*.json ./

# Instaliraj samo produkcione zavisnosti (bez TypeScripta i Nx-a)
RUN npm install --omit=dev

# Ekspoziraj port (port iz .env, npr. 3000)
EXPOSE 3000

# Pokreni server
CMD ["node", "dist/main.js"]
