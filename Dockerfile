# Stage 1: build the React frontend
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: install backend packages (the full image includes the build tools
# that better-sqlite3 needs if no ready made binary is available)
FROM node:20-bookworm AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Stage 3: small runtime image
FROM node:20-bookworm-slim
ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/data/quizmax.db
WORKDIR /app/backend
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/package.json ./
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://localhost:5000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
