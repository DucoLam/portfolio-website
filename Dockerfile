# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN rm -rf dist node_modules .vite && \
    npm install && \
    npm run build

# Stage 2: Serve with Caddy
FROM caddy:2.7.5-alpine

COPY Caddyfile /etc/caddy/Caddyfile

# ✅ Corrected: Copy contents of dist/ to the web root
COPY --from=builder /app/dist/ /usr/share/caddy/
