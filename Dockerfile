FROM oven/bun:1 AS builder
WORKDIR /app
COPY apps/bun/frontend/ .
RUN bun install && bun run build

FROM caddy:2.7.5-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /usr/share/caddy
