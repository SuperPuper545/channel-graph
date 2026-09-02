# ===================================================
# Stage 1: Build Frontend
# ===================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ===================================================
# Stage 2: Build Backend
# ===================================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# ===================================================
# Stage 3: Production Runner
# ===================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy backend dependencies and compiled code
COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=backend-builder /app/backend/dist ./dist

# Copy frontend static build files
COPY --from=frontend-builder /app/frontend/dist ./public

# Persistent data directory for channels and users
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3001

CMD ["node", "dist/index.js"]
