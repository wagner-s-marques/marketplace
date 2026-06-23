FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /data && chown -R app:app /data
USER app

ENV PORT=3000
ENV DATABASE_PATH=/data/catalog.db
EXPOSE 3000

CMD ["node", "dist/index.js"]
