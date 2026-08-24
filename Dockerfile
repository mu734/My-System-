# Stage 1: Build Frontend and Server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build Vite client and bundle Express server into dist/server.cjs
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled build output from builder
COPY --from=builder /app/dist ./dist

# Expose port (Cloud Run will override with $PORT)
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
