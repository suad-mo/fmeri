# ─── BUILD STAGE ─────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
RUN npm ci --legacy-peer-deps
COPY apps/api-server ./apps/api-server
COPY libs ./libs
RUN npx nx sync
RUN npx nx build api-server --configuration=production

# ─── PRODUCTION STAGE ────────────────────────────────────
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/dist/apps/api-server ./dist
COPY --from=builder /app/apps/api-server/src/assets ./assets
COPY --from=builder /app/apps/api-server/src/seeds/data ./dist/apps/api-server/src/seeds/data
RUN mkdir -p uploads/slike
EXPOSE 3000
CMD ["node", "dist/main.js"]
