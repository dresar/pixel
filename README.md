<div align="center">

# ⚡ PIXEL (BrevetAI)

### *Next-Generation Interactive Learning Platform & AI-Powered Tax Education Ecosystem*

[![React 19](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/)
[![Hono API](https://img.shields.io/badge/Hono-v4.12-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Database-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI--Engine-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.2-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

### 📌 QUICK NAVIGATION INDEX

[🌟 Overview](#-overview) • [📸 Asset Gallery](#-visual-showcase--asset-gallery) • [🚀 Feature Breakdown](#-complete-feature-guide) • [🏗️ Technical Architecture](#%EF%B8%8F-technical-architecture--system-design) • [🤖 9-Engine AI Studio](#-9-engine-ai-prompt-studio-subsystem) • [🗄️ Database & APIs](#%EF%B8%8F-database-schema--api-reference) • [📦 Setup & Deployment](#-setup-development--deployment-guide) • [🔍 Troubleshooting](#-troubleshooting--faq)

---

</div>

## 🌟 Overview

**Pixel (BrevetAI)** is a state-of-the-art, full-stack interactive educational application designed specifically for tax law mastery, Brevet A/B curriculum learning, interactive simulations, and AI-assisted case study solving. Built with **React 19**, **TanStack Start**, **Hono**, **Drizzle ORM**, and **Google Gemini AI**, Pixel merges gamified learning experiences (XP points, streak counters, interactive quizzes, flashcards, mind maps) with enterprise-grade administration tools (9-engine AI Prompt Studio, Claude JSON importer, live system telemetry, and content management).

> [!NOTE]
> **Repository**: [github.com/dresar/pixel](https://github.com/dresar/pixel)  
> **Status**: Production Ready & Fully Modular Architecture.

---

## 📸 Visual Showcase & Asset Gallery

Below is a complete showcase of Pixel's key user interface screens captured directly from the live application environment:

### 1. 🔐 Authentication & Quick-Fill Portal
Streamlined authentication system supporting multi-role sign-in (Student, Content Admin, Super Admin) with quick-fill demo keys for instant testing.
![Authentication Portal](./asset/Macbook-Air-localhost.webp)

---

### 2. 🎓 Student Learning Dashboard (`/beranda`)
Personalized learning hub featuring current streak tracking (14-day streak), accumulated XP points (1,450 XP), progress tracking, active module resume buttons, and 24/7 AI Tax Assistant consultation shortcuts.
![Student Dashboard](./asset/Macbook-Air-localhost%20(7).webp)

---

### 3. 🗺️ Interactive Learning Roadmap (`/roadmap`)
Guided step-by-step curriculum path mapping out Brevet A & B modules with estimated durations, earned XP badges, and structured progression tracking.
![Learning Roadmap](./asset/Macbook-Air-localhost%20(8).webp)

---

### 4. 📖 Learning Materials Catalog & Detail Reader (`/belajar/materi`)
Browse tax topics (Definisi Pajak, Subjek/Objek Pajak, PPh 17, Self-Assessment) with interactive story hooks, legal statute references (UU HPP & PMK 168), reading duration estimates, and floating AI assistant explanations.

| Materials Catalog | Material Detail Reader |
| :---: | :---: |
| ![Catalog](./asset/Macbook-Air-localhost%20(9).webp) | ![Reader](./asset/Macbook-Air-localhost%20(10).webp) |

---

### 5. 💼 Interactive Case Studies & Simulations (`/studi-kasus`)
Real-world tax scenario simulations covering dispute resolution (Keberatan SKP), PPN tax invoices (Faktur Pajak PER-03/PJ/2022), fiscal reconciliation, and SPT 1770 tax returns with level progression (Basic, Intermediate, Advanced).
![Student Case Studies](./asset/Macbook-Air-localhost%20(11).webp)

---

### 6. 📊 Admin Dashboard & Telemetry (`/admin/dashboard`)
Comprehensive administrative overview featuring total user metrics, active education modules, evaluation quiz banks, AI content engine status, and recent user signups.
![Admin Dashboard](./asset/Macbook-Air-localhost%20(1).webp)

---

### 7. 🤖 AI Prompt Studio & Multi-Engine Compiler (`/admin/prompt-studio`)
Enterprise AI compilation suite featuring 9 specialized AI prompt engines: Master System, Deep Research Engine, Tax Reasoning Engine, Curriculum Engine, Pedagogy Engine, JSON Engine, Visual Engine, Assessment Engine, and Quality Engine.
![AI Prompt Studio](./asset/Macbook-Air-localhost%20(5).webp)

---

### 8. 🛠️ Admin Content Management & Case Study CMS (`/admin/modul` & `/admin/studi-kasus`)
Full CRUD administrative suite for managing modules, chapters, case study scenarios, and importing structured Claude AI JSON curriculums.

| Curriculum Management | Case Study CMS |
| :---: | :---: |
| ![Modul CMS](./asset/Macbook-Air-localhost%20(2).webp) | ![Case Study CMS](./asset/Macbook-Air-localhost%20(3).webp) |

---

### 9. ⚙️ System Settings & Infrastructure Status (`/admin/pengaturan`)
Live server monitoring displaying Neon Postgres serverless database status, Better Auth session state, Gemini key rotation array status (54 API keys), minimum pass grade configuration, and platform branding settings.
![System Settings](./asset/Macbook-Air-localhost%20(6).webp)

---

### 10. 🎨 Responsive Layout & Sidebar Branding
Modern dark-mode aesthetic principles with glowing HSL accents, clean typography, dynamic glassmorphism, and responsive navigation sidebars.
![Sidebar Navigation](./asset/Macbook-Air-localhost%20(4).webp)

---

## 🚀 Complete Feature Guide

Pixel provides a dual-portal ecosystem designed for both learners and administrators:

### 👨‍🎓 Student Portal Features

| Feature Module | Endpoint | Description & Capabilities |
| :--- | :--- | :--- |
| **🔥 Dashboard & Telemetry** | `/beranda` | Displays daily learning streak counter, accumulated XP points, active module progress bar, and AI consultation launcher. |
| **🗺️ Curriculum Roadmap** | `/roadmap` | Gamified step-by-step visual learning path through Brevet A & B subjects with completion status. |
| **📖 Lesson Catalog & Reader** | `/belajar/materi` | Rich markdown reader with story hooks, legal statute callout boxes (UU HPP No. 7/2021, PMK 168/2023), and AI article explainer. |
| **💼 Case Studies & Simulations** | `/studi-kasus` | Real-world scenario simulations for tax dispute appeals (SKP), PPN e-Faktur 4.0, corporate fiscal reconciliation, and SPT 1770. |
| **📝 Quizzes & Evaluations** | `/kuis` | Interactive multiple-choice quizzes with instant grading, detailed answer explanations, and XP rewards. |
| **🎴 Flashcards & Glosarium** | `/glosarium`, `/kartu` | Dictionary of Indonesian tax terms and interactive study flashcards for quick revision. |
| **🏆 Gamification & Leaderboard** | `/peringkat`, `/progres` | Global student rankings by XP points, level badges, and downloadable completion certificates (`/sertifikat`). |

### 👨‍💼 Admin Management Features

| Feature Module | Endpoint | Description & Capabilities |
| :--- | :--- | :--- |
| **📊 Admin Dashboard** | `/admin/dashboard` | Key platform metrics (Total Users, Active Modules, Quiz Question Count, AI Engine Status, Recent Signups). |
| **📚 Modul & Materi CMS** | `/admin/modul` | Full CRUD operations for modules and lessons, reordering, and **One-Click Claude JSON Importer**. |
| **💼 Case Study CMS** | `/admin/studi-kasus` | Management panel for creating, editing, and publishing real-world tax dispute and simulation scenarios. |
| **🤖 9-Engine AI Prompt Studio** | `/admin/prompt-studio` | Specialized prompt engineering workspace for managing identity, legal research, tax reasoning, pedagogy, and output formats. |
| **👥 User & Role Management** | `/admin/pengguna` | Manage registered users, assign roles (`STUDENT`, `ADMIN`, `SUPER_ADMIN`), and view individual learning progress. |
| **⚙️ System Settings & Health** | `/admin/pengaturan` | Monitor serverless Neon DB connectivity, Better Auth state, Gemini key rotation array (54 keys), and platform settings. |

---

## 🏗️ Technical Architecture & System Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND PRESENTATION LAYER                     │
│  React 19  │  TanStack Router  │  Tailwind CSS v4  │  Radix UI  │ Sonner │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SSR / API Bridge
┌───────────────────────────────────▼────────────────────────────────────┐
│                         BACKEND APPLICATION LAYER                      │
│  Hono v4 Framework  │  Better Auth  │  Zod Validation  │  tsx / Nitro  │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Database ORM                   │ Generative AI
┌───────────────────▼────────────────┐   ┌───────────▼───────────────────┐
│          DATA PERSISTENCE          │   │         AI ENGINE SUITE       │
│  Drizzle ORM + Neon DB Serverless  │   │   Google Gemini 0.24 + System  │
└────────────────────────────────────┘   └───────────────────────────────┘
```

### Technical Component Inventory

| Layer | Core Technology | Primary Purpose & Usage |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19.2.0** | Component rendering, concurrent transitions, hooks |
| **Routing & SSR** | **TanStack Start & Router v1.170** | Type-safe routing, code splitting, SSR, data loaders |
| **Styling System** | **Tailwind CSS v4.2 & Radix UI** | Responsive dark/light theme system, accessible dialogs, tabs, popovers |
| **State & Cache** | **TanStack React Query v5.101** | Server state caching, optimistic UI updates, background prefetching |
| **Backend Web Server**| **Hono v4.12 & Node HTTP Server** | Lightweight ultra-fast web framework handling `/api/*` endpoints |
| **Database ORM** | **Drizzle ORM v0.45** | Type-safe SQL query builder and schema definitions |
| **Database Engine** | **Neon PostgreSQL Serverless** | Scalable cloud PostgreSQL with serverless WebSocket pool |
| **Authentication** | **Better Auth v1.6** | User session management, role-based authorization, security tokens |
| **AI Processing** | **@google/generative-ai v0.24** | Gemini model execution, legal text reasoning, content generation |

---

### Data Flow Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student / Admin User
    participant Router as TanStack Router Layer
    participant Hono as Hono API Server
    participant Auth as Better Auth Handler
    participant Drizzle as Drizzle ORM
    participant DB as Neon PostgreSQL
    participant Gemini as Google Gemini AI Engine

    Student->>Router: Navigate to Route (e.g. /belajar/materi/definisi-pajak)
    Router->>Hono: Fetch Loader Data / API Request
    Hono->>Auth: Validate User Session & Roles
    Auth-->>Hono: Session Verified (Role: STUDENT / ADMIN)
    
    alt Database Query
        Hono->>Drizzle: Query Module / Lesson Content
        Drizzle->>DB: Execute SQL Query via Serverless Pool
        DB-->>Drizzle: Return Dataset
        Drizzle-->>Hono: Type-safe Entity Records
    else AI Assistant Consultation
        Hono->>Gemini: Send Multi-Engine Compiled System Prompt + User Query
        Gemini-->>Hono: Generated Explanation & Legal Reference Struct
    end
    
    Hono-->>Router: JSON Response Data
    Router-->>Student: Render React 19 UI View with Animations
```

---

### 📂 Codebase & Folder Map

```
pixel/
├── asset/                        # MacBook mockup screenshots and graphic assets
├── api/                          # Serverless entry points for deployment
├── public/                       # Static public assets, favicons, fonts
├── src/
│   ├── components/               # Reusable UI & Business components
│   │   ├── ui/                   # Radix UI + Tailwind primitives (Buttons, Cards, Dialogs)
│   │   ├── admin/                # CMS components (Module editor, Quiz builder, Prompt editor)
│   │   └── student/              # Student components (XP cards, Streaks, Roadmap tree)
│   ├── functions/                # Utility helpers and server functions
│   ├── hooks/                    # Custom React hooks (Theme, Auth, Telemetry)
│   ├── lib/                      # Core configuration (Drizzle client, Gemini client, utils)
│   ├── routeTree.gen.ts          # Auto-generated TanStack Router tree
│   ├── router.tsx                # TanStack Router instance setup
│   ├── routes/                   # File-based TanStack routes
│   │   ├── __root.tsx            # Global Root layout with providers & Toaster
│   │   ├── _app.admin.*.tsx      # Admin Portal pages (Dashboard, Modul, Prompt Studio, Users)
│   │   ├── _app.ai.*.tsx         # AI Assistant pages (Chat, Explained, Notes)
│   │   ├── _app.belajar.*.tsx    # Student Learning pages (Catalog, Reader, Quizzes)
│   │   ├── _app.beranda.tsx      # Student Main Dashboard
│   │   ├── _app.roadmap.tsx      # Interactive Curriculum Journey
│   │   ├── index.tsx             # Public Landing Page
│   │   ├── masuk.tsx             # Login Screen
│   │   └── daftar.tsx            # Registration Screen
│   └── server/                   # Hono Backend Application
│       ├── app.ts                # Main Hono app routing assembly
│       ├── config/               # Environment & system configurations
│       ├── database/             # Drizzle Schema definitions
│       │   ├── schema/
│       │   │   ├── ai.schema.ts
│       │   │   ├── glossary.schema.ts
│       │   │   ├── media.schema.ts
│       │   │   ├── modules.schema.ts
│       │   │   ├── quiz.schema.ts
│       │   │   ├── studi-kasus.schema.ts
│       │   │   └── users.schema.ts
│       │   └── index.ts          # Database instance initialization
│       └── features/             # Hono Feature Controllers
│           ├── ai-engine/        # Gemini AI generation pipeline
│           ├── api-keys/         # API key rotation & management
│           ├── auth/             # Authentication routes & middleware
│           ├── modules/          # Curriculum & lesson CRUD controller
│           ├── prompt-studio/    # 9-Engine Prompt Compiler & Studio
│           ├── quiz/             # Quiz evaluation engine
│           └── users/            # User profile & XP management
├── drizzle.config.ts             # Drizzle Kit migration configuration
├── vite.config.ts                # Vite build & TanStack plugin config
├── package.json                  # Dependencies & scripts
└── tsconfig.json                 # Strict TypeScript configuration
```

---

## 🤖 9-Engine AI Prompt Studio Subsystem

Pixel compiles dynamic AI outputs using **9 specialized engine layers** defined in `src/server/features/prompt-studio/`:

```
                  ┌─────────────────────────────────────┐
                  │       MASTER SYSTEM ENGINE (#1)     │
                  │   Core identity, mission & bounds   │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  DEEP RESEARCH   │       │  TAX REASONING   │       │CURRICULUM ENGINE │
│   ENGINE (#2)    │       │   ENGINE (#3)    │       │   ENGINE (#4)    │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         ├──────────────────────────┼──────────────────────────┤
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ PEDAGOGY ENGINE  │       │ JSON OUTPUT FMT  │       │  VISUAL ENGINE   │
│   ENGINE (#5)    │       │   ENGINE (#6)    │       │   ENGINE (#7)    │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
                  ┌─────────────────────────────────────┐
                  │  ASSESSMENT (#8) & QUALITY (#9)     │
                  │    Evaluation, validation & output  │
                  └─────────────────────────────────────┘
```

1. **Master System Engine (`MASTER_SYSTEM`)**: Core identity, production bounds, safety guardrails.
2. **Deep Research Engine (`RESEARCH_ENGINE`)**: Multi-source law search engine (UU, PP, PMK, PER, DJP FAQs, tax court precedents).
3. **Tax Reasoning Engine (`TAX_REASONING_ENGINE`)**: End-to-end tax calculation logic (PPh 21 TER tariffs, PTKP, PPN 11%, fiscal reconciliation).
4. **Curriculum Engine (`CURRICULUM_ENGINE`)**: Hierarchy planning for modules, chapters, IKPI sequence, and prerequisites.
5. **Pedagogy Engine (`PEDAGOGY_ENGINE`)**: Adaptive learning strategy (scaffolding, real-world analogies, chunking).
6. **JSON Output Engine (`JSON_ENGINE`)**: Schema compiler guaranteeing valid JSON format with `{{JSON_SCHEMA_VERSION}}` compatibility.
7. **Visual Engine (`VISUAL_ENGINE`)**: Prompt builder for generating diagrams, flowcharts, infographics, and mindmaps.
8. **Assessment Engine (`ASSESSMENT_ENGINE`)**: Multi-format evaluation engine (Quiz, Flashcard, Matching, Fill-in-Blank, Essay).
9. **Quality Engine (`QUALITY_ENGINE`)**: Multi-layer audit engine validating legal compliance, schema completeness, and citation links.

---

## 🗄️ Database Schema & API Reference

### Database Table Schemas (Drizzle ORM & Neon Postgres)

#### 1. `users` Table
```typescript
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["STUDENT", "ADMIN", "SUPER_ADMIN"] }).default("STUDENT").notNull(),
  avatarUrl: text("avatar_url"),
  xp: integer("xp").default(0).notNull(),
  streakCount: integer("streak_count").default(0).notNull(),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### 2. `modules` & `materi` Tables
```typescript
export const modules = pgTable("modules", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  level: text("level", { enum: ["DASAR", "MENENGAH", "LANJUT"] }).default("DASAR").notNull(),
  status: text("status", { enum: ["DRAFT", "TERBIT", "ARSIP"] }).default("DRAFT").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const materi = pgTable("materi", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  storyHook: text("story_hook"),
  content: text("content").notNull(),
  legalReference: text("legal_reference"),
  estimatedReadTime: integer("estimated_read_time").default(15),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### 3. `studi_kasus` Table
```typescript
export const studiKasus = pgTable("studi_kasus", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category", { enum: ["Sengketa", "PPN", "PPh Badan", "PPh OP"] }).notNull(),
  difficulty: text("difficulty", { enum: ["DASAR", "MENENGAH", "LANJUT"] }).notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  description: text("description").notNull(),
  scenarioContent: text("scenario_content").notNull(),
  status: text("status", { enum: ["DRAFT", "TERBIT"] }).default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### Hono API Route Catalog

| Category | Method | Endpoint | Description | Role |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user session | Public |
| **Auth** | `GET` | `/api/auth/me` | Fetch active session profile | `STUDENT` |
| **Modules** | `GET` | `/api/modules` | Fetch all published learning modules | `STUDENT` |
| **Modules** | `POST` | `/api/modules/import-claude` | Import Claude JSON structured curriculum | `ADMIN` |
| **Lessons** | `GET` | `/api/materi/:slug` | Fetch lesson content by slug | `STUDENT` |
| **AI Studio**| `GET` | `/api/prompt-studio/engines` | List all 9 AI Prompt Engines | `ADMIN` |
| **AI Studio**| `POST` | `/api/prompt-studio/compile` | Compile all prompt engines into system prompt | `ADMIN` |
| **AI Engine**| `POST` | `/api/ai-engine/consult` | Stream AI Tax Assistant response | `STUDENT` |
| **Settings** | `GET` | `/api/settings/telemetry` | Check Neon DB & Gemini Key pool health | `SUPER_ADMIN` |

---

## 📦 Setup, Development & Deployment Guide

### Prerequisites
* **Node.js**: `v20.0.0+`
* **Package Manager**: `npm` v10+ or `bun` v1.1+
* **Database**: Neon Serverless PostgreSQL instance ([neon.tech](https://neon.tech))
* **AI Key**: Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

---

### Environment Variables (`.env`)

```bash
cp .env.production .env
```

| Key Name | Type | Description | Required | Example |
| :--- | :---: | :--- | :---: | :--- |
| `DATABASE_URL` | String | Neon PostgreSQL Connection URI | ✅ Yes | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `BETTER_AUTH_SECRET` | String | Session encryption secret | ✅ Yes | `random_32_character_secret_key` |
| `BETTER_AUTH_URL` | String | Base URL of the application | ✅ Yes | `http://localhost:3000` |
| `GEMINI_API_KEY` | String | Primary Google Gemini API key | ✅ Yes | `AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxx` |
| `GEMINI_KEYS_POOL` | String | Fallback rotation keys array | 💡 Optional | `key1,key2,key3,...` |
| `NODE_ENV` | Enum | Environment mode | ✅ Yes | `development` or `production` |

---

### Local Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Push database schema to Neon
npm run db:push

# 3. Launch concurrent development server (Frontend + Backend)
npm run dev
```

> Access local server at 👉 **`http://localhost:3000`**

---

### Deployment Options

#### 1. Vercel Deployment (Configured in `vercel.json`)
Connect repository to Vercel, set Environment Variables, and click **Deploy**. Vercel will automatically build Vite and deploy Hono serverless edge functions.

#### 2. Docker Container Deployment
```bash
docker build -t pixel-app .
docker run -p 3000:3000 --env-file .env pixel-app
```

---

## 🔍 Troubleshooting & FAQ

### Q1: `Error: EADDRINUSE: address already in use :::3000`
Run the port cleanup script to kill zombie node processes:
```bash
npm run kill-port
```

### Q2: Gemini API `429 Rate Limit Exceeded`
Configure multiple Gemini keys in `GEMINI_KEYS_POOL` in `.env`. Pixel's System Settings feature will automatically cycle through available keys.

### Q3: Neon DB connection timeout
Ensure `DATABASE_URL` ends with `?sslmode=require`.

---

## 📄 License & Credits

Built with ❤️ by [dresar](https://github.com/dresar) using **TanStack Start**, **React 19**, **Hono**, **Drizzle ORM**, **Neon Database**, and **Google Gemini AI**.
