# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only the BFF package.json (not the monorepo root — avoids workspace errors)
COPY services/bff/package*.json ./

# Install all deps (including devDeps needed for TypeScript compilation)
RUN npm install --legacy-peer-deps

# Copy BFF source
COPY services/bff/ ./

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install production deps only
COPY services/bff/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Render injects PORT dynamically — server reads process.env.PORT
EXPOSE 3000

CMD ["node", "dist/server.js"]
