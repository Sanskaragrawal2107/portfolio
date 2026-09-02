# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Pass the backend URL & usernames at build time (can be overridden with --build-arg)
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

ARG NEXT_PUBLIC_GITHUB_USERNAME=Sanskaragrawal2107
ENV NEXT_PUBLIC_GITHUB_USERNAME=$NEXT_PUBLIC_GITHUB_USERNAME

ARG NEXT_PUBLIC_LEETCODE_USERNAME=sanskaragrawal
ENV NEXT_PUBLIC_LEETCODE_USERNAME=$NEXT_PUBLIC_LEETCODE_USERNAME

RUN npm run build

# ── Stage 2: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only copy what Next.js needs to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
