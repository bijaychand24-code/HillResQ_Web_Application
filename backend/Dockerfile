FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY . .

# Ensure uploads directory exists and permissions are secure
RUN mkdir -p src/uploads && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]

