# سُفرة — صورة إنتاج. لا مترجم أصلي ولا أدوات بناء: node:sqlite مدمج في Node.
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SUFRA_DB_PATH=/data/sufra.db

RUN useradd -m -u 1001 sufra && mkdir -p /data && chown sufra:sufra /data

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# السكيما والبذرة تُقرأان من القرص وقت التشغيل — التتبّع لا يلتقط ملفات .sql
COPY --from=builder /app/lib/db ./lib/db

USER sufra
VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "server.js"]
