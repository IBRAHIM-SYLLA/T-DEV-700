# =====================
# FRONTEND BUILD
# =====================
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend .
RUN npm run build

# =====================
# BACKEND BUILD
# =====================
FROM node:22-slim AS backend-builder
WORKDIR /app
COPY API/package*.json ./
RUN npm ci --only=production
COPY API .
RUN npm run build

# =====================
# FINAL IMAGE
# =====================
FROM nginx:alpine

RUN apk add --no-cache nodejs npm gettext

# Frontend
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# Backend
WORKDIR /app
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./

# Nginx template
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 80

RUN rm -f /etc/nginx/nginx.conf
CMD sh -c "envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf \
    && node dist/server.js & \
    nginx -g 'daemon off;'"


