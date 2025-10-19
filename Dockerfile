# Stage 1: Build the frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Declare build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm install
COPY . .

# Use build arguments to create a .env file, then build
RUN echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}" > .env && \
    echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}" >> .env && \
    npm run build

# Stage 2: Create the production server
FROM node:22-alpine
WORKDIR /workspace/server

# Copy server dependencies and install
COPY server/package*.json .
RUN npm install --only=production

# Copy the necessary files
COPY server/server.js .
COPY server/cronSync.js .
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run both the web server and the sync script in parallel
CMD ["node", "server.js"]