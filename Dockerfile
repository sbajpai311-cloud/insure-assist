FROM node:20-alpine
WORKDIR /app

# Copy BFF package.json only (not monorepo root — avoids workspace conflicts)
COPY services/bff/package.json ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy BFF source files
COPY services/bff/src ./src
COPY services/bff/tsconfig.json ./

# Compile TypeScript
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.js"]
