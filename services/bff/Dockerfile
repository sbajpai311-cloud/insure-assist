FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Install production dependencies only — keeps image small
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
# No hardcoded HEALTHCHECK — Render uses healthCheckPath from render.yaml
CMD ["node", "dist/server.js"]
