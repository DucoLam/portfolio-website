# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything into the container
COPY . .

# Always clean before install/build
RUN rm -rf dist node_modules .vite && \
    npm install && \
    npm run build

# Stage 2: Serve with Caddy
FROM caddy:2.7.5-alpine

# Copy Caddyfile into Caddy's config location
COPY Caddyfile /etc/caddy/Caddyfile

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/caddy
