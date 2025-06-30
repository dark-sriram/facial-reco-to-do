# Multi-stage build for Facial Recognition Todo App

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/to_do_app/package*.json ./
RUN npm ci --only=production

COPY frontend/to_do_app/ ./
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine AS backend-setup

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Stage 3: Production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/
COPY --from=backend-setup /app/backend/node_modules ./backend/node_modules

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./backend/dist

# Copy root package.json
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["dumb-init", "node", "backend/src/server.js"]