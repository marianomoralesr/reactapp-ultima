# ---------- Stage 1: Build the frontend ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Build arguments for Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Install dependencies and build
COPY package*.json ./
RUN npm ci
COPY . .

# Inject env vars and build
RUN echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}" > .env && \
    echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}" >> .env && \
    npm run build


# ---------- Stage 2: Production server ----------
FROM node:22-alpine
WORKDIR /workspace

# Copy server and install only production dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server files
COPY server/server.js server/
COPY server/cronSync.js server/

# Copy build output (frontend)
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Run server
CMD ["node", "server/server.js"]