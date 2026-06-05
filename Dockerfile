FROM node:20-slim AS builder
WORKDIR /app
COPY apps/bun/frontend/ .
RUN npm install && npm run build

FROM caddy:2.7.5-alpine
ARG CACHE_BUST=dev
RUN echo "${CACHE_BUST}" > /dev/null
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /usr/share/caddy
