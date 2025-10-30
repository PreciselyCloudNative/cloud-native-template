# Precisely Cloud Native Template - Production Dockerfile
# Multi-stage build for optimized production image

# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM node:20-alpine AS dependencies

# Update Alpine packages and fix OpenSSL vulnerabilities
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache openssl>=3.3.5-r0 libssl3>=3.3.5-r0 libcrypto3>=3.3.5-r0 && \
    rm -rf /var/cache/apk/* && \
    npm install -g npm@10.9.3

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# ===========================================
# Stage 2: Production
# ===========================================
FROM node:20-alpine

# Update Alpine packages and fix OpenSSL vulnerabilities
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache openssl>=3.3.5-r0 libssl3>=3.3.5-r0 libcrypto3>=3.3.5-r0 && \
    rm -rf /var/cache/apk/* && \
    npm install -g npm@10.9.3

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs public ./public

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
