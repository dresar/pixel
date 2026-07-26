<div align="center">

# 🗄️ Database Schema & API Reference

### *Pixel (BrevetAI) — Neon Postgres Schema & Hono REST API Specifications*

[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Database-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Hono API](https://img.shields.io/badge/Hono-v4.12-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![Zod Validation](https://img.shields.io/badge/Zod-v3.24-3068B7?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)

---

### 📚 DOCUMENTATION SUITE

| 📘 Master Gateway | 🏗️ Architecture | 🚀 Features | 🗄️ API & DB | 📦 Setup & Deploy |
| :---: | :---: | :---: | :---: | :---: |
| [**README.md**](./README.md) | [**DOCS_ARCHITECTURE.md**](./DOCS_ARCHITECTURE.md) | [**DOCS_FEATURES.md**](./DOCS_FEATURES.md) | [**DOCS_API_DATABASE.md**](./DOCS_API_DATABASE.md) | [**DOCS_SETUP_DEPLOYMENT.md**](./DOCS_SETUP_DEPLOYMENT.md) |

---

</div>

## 🗄️ Database Schema Architecture

Pixel utilizes **Drizzle ORM** with **Neon PostgreSQL Serverless**. Database schemas are defined modularly under `src/server/database/schema/`.

```
                    ┌─────────────────────────┐
                    │      users_table        │
                    └────────────┬────────────┘
                                 │ 1:N
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│   user_xp      │      │ quiz_results   │      │ notifications  │
└────────────────┘      └────────────────┘      └────────────────┘

                    ┌─────────────────────────┐
                    │     modules_table       │
                    └────────────┬────────────┘
                                 │ 1:N
                                 ▼
                    ┌─────────────────────────┐
                    │     materi_table        │
                    └────────────┬────────────┘
                                 │ 1:N
                                 ▼
                    ┌─────────────────────────┐
                    │     quizzes_table       │
                    └─────────────────────────┘
```

---

## 📋 Entity Specifications & Definitions

### 1. User & Authentication Schemas (`users.schema.ts`)

#### `users` Table
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

---

### 2. Curriculum & Lesson Schemas (`modules.schema.ts`)

#### `modules` Table
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
```

#### `materi` Table
```typescript
export const materi = pgTable("materi", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  storyHook: text("story_hook"),
  content: text("content").notNull(),
  legalReference: text("legal_reference"), // e.g. UU No. 7 Tahun 2021 (UU HPP)
  estimatedReadTime: integer("estimated_read_time").default(15), // in minutes
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### 3. Evaluation & Quiz Schemas (`quiz.schema.ts`)

#### `quizzes` Table
```typescript
export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  materiId: text("materi_id").references(() => materi.id),
  title: text("title").notNull(),
  passingScore: integer("passing_score").default(70).notNull(),
  xpReward: integer("xp_reward").default(100).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### `quiz_questions` Table
```typescript
export const quizQuestions = pgTable("quiz_questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswerIndex: integer("correct_answer_index").notNull(),
  explanation: text("explanation"),
});
```

---

### 4. Case Studies Schema (`studi-kasus.schema.ts`)

#### `studi_kasus` Table
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

### 5. AI Prompt Studio Schema (`ai.schema.ts`)

#### `ai_prompt_engines` Table
```typescript
export const aiPromptEngines = pgTable("ai_prompt_engines", {
  id: text("id").primaryKey(),
  engineKey: text("engine_key").notNull().unique(), // e.g. RESEARCH_ENGINE, TAX_REASONING
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  version: integer("version").default(1).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## 🌐 Hono API Route Catalog

The backend service is located at `/api/*` defined in `src/server/app.ts`.

### 1. Authentication Routes (`/api/auth/*`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Sign in with email and password | ❌ |
| `POST` | `/api/auth/register` | Register new student account | ❌ |
| `POST` | `/api/auth/logout` | End session and clear cookies | ✅ |
| `GET` | `/api/auth/me` | Fetch active user session profile | ✅ |

---

### 2. Modules & Curriculum Routes (`/api/modules/*`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/modules` | Fetch all published learning modules | `STUDENT` |
| `GET` | `/api/modules/:slug` | Fetch module details by slug | `STUDENT` |
| `POST` | `/api/modules` | Create new module record | `ADMIN` |
| `PUT` | `/api/modules/:id` | Update existing module record | `ADMIN` |
| `POST` | `/api/modules/import-claude` | Import Claude JSON structured curriculum | `ADMIN` |
| `DELETE`| `/api/modules/:id` | Delete module and associated lessons | `SUPER_ADMIN` |

---

### 3. Material & Lessons Routes (`/api/materi/*`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/materi` | List material catalog with filters | `STUDENT` |
| `GET` | `/api/materi/:slug` | Fetch lesson content by slug | `STUDENT` |
| `POST` | `/api/materi` | Create lesson record | `ADMIN` |
| `PUT` | `/api/materi/:id` | Update lesson content | `ADMIN` |

---

### 4. AI Engine & Prompt Studio (`/api/prompt-studio/*` & `/api/ai-engine/*`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/prompt-studio/engines` | List all 9 AI Prompt Engines | `ADMIN` |
| `PUT` | `/api/prompt-studio/engines/:id`| Update engine system prompt & version | `SUPER_ADMIN` |
| `POST` | `/api/prompt-studio/compile` | Test compile all 9 prompt engines | `ADMIN` |
| `POST` | `/api/ai-engine/consult` | Stream AI Tax Assistant response | `STUDENT` |
| `POST` | `/api/ai-engine/explain-article`| Explain tax law article using Gemini | `STUDENT` |

---

### 5. System Settings (`/api/settings/*`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/settings` | Fetch global platform settings & status | `ADMIN` |
| `PUT` | `/api/settings` | Update minimum pass score & branding | `SUPER_ADMIN` |
| `GET` | `/api/settings/telemetry` | Check Neon DB & Gemini Key pool health | `SUPER_ADMIN` |

---

## 📡 Sample Request & Response Payloads

### Example 1: `POST /api/modules/import-claude`

#### Request Payload
```json
{
  "title": "Ketentuan Umum dan Tata Cara Perpajakan (KUP)",
  "slug": "kup-brevet-ab",
  "level": "DASAR",
  "materi": [
    {
      "title": "Nomor Pokok Wajib Pajak (NPWP) & NIK Integration",
      "slug": "npwp-nik-integration",
      "storyHook": "Sejak berlakunya UU HPP, NIK 16 digit telah terintegrasi penuh sebagai NPWP Orang Pribadi...",
      "content": "Pembahasan lengkap mengenai kewajiban pendaftaran NPWP...",
      "legalReference": "UU No. 7 Tahun 2021 • Pasal 2"
    }
  ]
}
```

#### Response Payload (`201 Created`)
```json
{
  "success": true,
  "message": "Module imported successfully",
  "data": {
    "moduleId": "mod_kup_9921",
    "importedLessonsCount": 1,
    "status": "DRAFT"
  }
}
```
