<div align="center">

# 📦 Setup, Development & Deployment Guide

### *Pixel (BrevetAI) — Installation, Environment Configuration & Cloud Deployment*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Node.js v20+](https://img.shields.io/badge/Node.js-v20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Bun Package Manager](https://img.shields.io/badge/Bun-v1.1-FBF0DF?style=for-the-badge&logo=bun&logoColor=black)](https://bun.sh/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Database-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)

---

### 📚 DOCUMENTATION SUITE

| 📘 Master Gateway | 🏗️ Architecture | 🚀 Features | 🗄️ API & DB | 📦 Setup & Deploy |
| :---: | :---: | :---: | :---: | :---: |
| [**README.md**](./README.md) | [**DOCS_ARCHITECTURE.md**](./DOCS_ARCHITECTURE.md) | [**DOCS_FEATURES.md**](./DOCS_FEATURES.md) | [**DOCS_API_DATABASE.md**](./DOCS_API_DATABASE.md) | [**DOCS_SETUP_DEPLOYMENT.md**](./DOCS_SETUP_DEPLOYMENT.md) |

---

</div>

## 📌 System Prerequisites

Before initializing Pixel locally or in a deployment environment, ensure your machine satisfies the following runtime requirements:

* **Node.js**: `v20.0.0` or higher (LTS recommended).
* **Package Manager**: `npm` v10+ or `bun` v1.1+.
* **Database**: Neon Serverless PostgreSQL instance (free tier supported at [neon.tech](https://neon.tech)).
* **AI Provider**: Google Gemini API Key (obtained at [aistudio.google.com](https://aistudio.google.com)).
* **Git**: Installed for version management.

---

## 🔑 Environment Variables Specification

Create a `.env` file in the root directory. You can copy `.env.production` as a starting template:

```bash
cp .env.production .env
```

### Complete Environment Matrix

| Key Name | Type | Description | Required | Example / Default |
| :--- | :---: | :--- | :---: | :--- |
| `DATABASE_URL` | String | Neon PostgreSQL Connection URI | ✅ Yes | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `BETTER_AUTH_SECRET` | String | Secret key for session encryption | ✅ Yes | `random_32_character_secret_key_here` |
| `BETTER_AUTH_URL` | String | Base URL of the application | ✅ Yes | `http://localhost:3000` |
| `GEMINI_API_KEY` | String | Primary Google Gemini API key | ✅ Yes | `AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxx` |
| `GEMINI_KEYS_POOL` | String | Comma-separated list for auto key rotation | 💡 Optional | `key1,key2,key3,...` |
| `CLOUDINARY_URL` | String | Cloudinary media upload URI | 💡 Optional | `cloudinary://key:secret@cloudname` |
| `NODE_ENV` | Enum | Environment mode | ✅ Yes | `development` or `production` |
| `PORT` | Number | Dev server port | 💡 Optional | `3000` |

---

## 🛠️ Step-by-Step Local Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/dresar/pixel.git
cd pixel
```

### Step 2: Install Node Dependencies
Using `npm`:
```bash
npm install
```
Or using `bun`:
```bash
bun install
```

### Step 3: Configure Database Schemas via Drizzle Kit
Push the Drizzle ORM schema definitions directly to your Neon PostgreSQL database:
```bash
# Push schema directly to database
npm run db:push

# (Optional) Generate Drizzle migration files
npm run db:generate

# (Optional) Apply existing migrations
npm run db:migrate
```

### Step 4: Launch Concurrent Local Development Server
Pixel uses `concurrently` to run both Vite frontend hot-reloading and Hono backend TSX watch mode simultaneously:
```bash
npm run dev
```

> [!TIP]
> The `npm run dev` script automatically executes `npm run predev`, which cleans up any stuck processes on ports `3000`, `3001`, `5173`, `8080`, and `8081` using `kill-port`.

Once started, open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🚀 Available NPM Scripts

Below is the complete inventory of scripts configured in `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently -n \"frontend,backend\" -c \"cyan.bold,magenta.bold\" \"vite dev --port 3000\" \"tsx watch src/server/app.ts\"",
    "dev:frontend": "vite dev --port 3000",
    "dev:backend": "tsx watch src/server/app.ts",
    "predev": "npx kill-port 3000 3001 5173 8080 8081",
    "kill-port": "npx kill-port 3000 3001 5173 8080 8081",
    "build": "vite build",
    "build:backend": "tsc -p tsconfig.json",
    "build:all": "vite build",
    "db:generate": "drizzle-kit generate --config=drizzle.config.ts",
    "db:migrate": "drizzle-kit migrate --config=drizzle.config.ts",
    "db:push": "drizzle-kit push --config=drizzle.config.ts",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

---

## ☁️ Production Deployment

### Option 1: Vercel Deployment (Recommended)

Pixel includes native configuration for Vercel deployment (`vercel.json`):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "vite.config.ts",
      "use": "@vercel/vite"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Vercel Deployment Steps:
1. Push your code to GitHub: `git push origin main`.
2. Connect repository to [Vercel Dashboard](https://vercel.com/new).
3. Add Environment Variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GEMINI_API_KEY`, `BETTER_AUTH_URL`).
4. Click **Deploy**. Vercel will automatically build Vite and deploy Hono serverless edge functions.

---

### Option 2: Docker Container Deployment

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "dev:backend"]
```

Build and run container:
```bash
docker build -t pixel-app .
docker run -p 3000:3000 --env-file .env pixel-app
```

---

## 🔍 Troubleshooting & FAQ

### Q1: `Error: EADDRINUSE: address already in use :::3000`
**Solution**: Run the port cleanup command to terminate zombie node processes:
```bash
npm run kill-port
```

### Q2: Neon DB connection error (`WebSocket connection failed`)
**Solution**: Verify that `DATABASE_URL` contains `?sslmode=require`. Ensure your firewall allows outbound WebSockets on port 443.

### Q3: Gemini AI API `429 Rate Limit Exceeded`
**Solution**: Configure multiple Gemini keys in `GEMINI_KEYS_POOL` in your `.env` file. Pixel's System Settings feature automatically cycles through available keys when rate limits are approached.

### Q4: Drizzle push fails with missing table error
**Solution**: Reset migration status or run `npm run db:push --force` to synchronize local schemas directly with Neon.
