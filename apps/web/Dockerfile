# ─── BUILD STAGE ─────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
RUN npm ci --legacy-peer-deps
COPY apps/web ./apps/web
COPY libs ./libs
RUN npx nx sync
RUN npx nx build web --configuration=production

# ─── PRODUCTION STAGE ────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/dist/apps/web/browser /usr/share/nginx/html
COPY infra/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]