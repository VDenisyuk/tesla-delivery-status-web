# ---------- BASE IMAGE ----------
FROM node:22-alpine AS base
WORKDIR /app

# ---------- DEPENDENCIES ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- BUILD REACT APP ----------
FROM deps AS build
COPY . .
RUN npm run build

# ---------- PRODUCTION IMAGE ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Install a tiny static file server (or use your own Express server)
#RUN npm install -g serve
RUN npm install express serve-handler

# Copy production bundle
COPY --from=build /app/dist ./dist
COPY server.cjs .

EXPOSE 3000

# Start static server
#CMD ["serve", "-s", "dist", "-l", "3000"]
CMD ["node", "server.cjs"]
