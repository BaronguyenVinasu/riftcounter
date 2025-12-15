# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../shared/package*.json ./shared/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
COPY ../shared ./shared

# Build
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 3001

CMD ["node", "dist/index.js"]
