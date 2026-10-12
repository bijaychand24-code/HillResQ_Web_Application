# ============================================================
# Stage 1: Build React Frontend Single-Page Application (SPA)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend dependency declarations
COPY frontend/package*.json ./

# Install frontend dependencies cleanly
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build production bundle to /app/frontend/dist
RUN npm run build

# ============================================================
# Stage 2: Production Backend & Full-Stack Runner
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install curl for container healthcheck
RUN apk add --no-cache curl

# Copy root metadata
COPY package.json ./

# Copy backend dependencies declarations
COPY backend/package*.json ./backend/

# Install only production dependencies for the backend
RUN npm ci --omit=dev --prefix backend

# Copy backend application source code
COPY backend/ ./backend/

# Copy compiled frontend distribution from builder stage
# backend/src/app.js serves this from ../../frontend/dist in production
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure uploads directory exists and set correct permissions
RUN mkdir -p ./backend/src/uploads && chown -R node:node /app

# Run as non-privileged user for security
USER node

# Expose backend port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start HillResQ unified production server
CMD ["node", "backend/src/server.js"]

