<div align="center">

# 🚀 Feature Guide & Visual Showcase

### *Pixel (BrevetAI) — Complete Student & Admin Feature Documentation*

[![React 19](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/)
[![Hono API](https://img.shields.io/badge/Hono-v4.12-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI--Engine-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

---

### 📚 DOCUMENTATION SUITE

| 📘 Master Gateway | 🏗️ Architecture | 🚀 Features | 🗄️ API & DB | 📦 Setup & Deploy |
| :---: | :---: | :---: | :---: | :---: |
| [**README.md**](./README.md) | [**DOCS_ARCHITECTURE.md**](./DOCS_ARCHITECTURE.md) | [**DOCS_FEATURES.md**](./DOCS_FEATURES.md) | [**DOCS_API_DATABASE.md**](./DOCS_API_DATABASE.md) | [**DOCS_SETUP_DEPLOYMENT.md**](./DOCS_SETUP_DEPLOYMENT.md) |

---

</div>

## 🎯 Overview

**Pixel (BrevetAI)** is a comprehensive tax learning management system designed to serve both **Students** (who engage in interactive modules, quizzes, case studies, and AI consultation) and **Administrators** (who manage curriculum content, AI prompts, user roles, and system infrastructure).

---

## 👨‍🎓 Student Portal Features

### 1. 🔐 Multi-Role Authentication & Dev Quick-Fill

The authentication portal allows quick sign-in using email and password, or one-click role switching for development testing:
* **Super Admin**: Full platform access.
* **Admin Konten**: Content editing and curriculum management.
* **Siswa Brevet**: Student access for learning and evaluation.

![Authentication Portal](./asset/Macbook-Air-localhost.webp)

---

### 2. 🎓 Student Dashboard (`/beranda`)

The central student hub provides real-time learning metrics, active streak monitoring, XP level counters, and direct shortcuts:
* 🔥 **Rentetan Belajar (Streak)**: Tracks consecutive daily learning activity (e.g., 14 Days Active).
* ⚡ **Poin XP Terkumpul**: Accumulates experience points for completed modules and quizzes.
* 📚 **Modul Aktif**: Displays current active course module with progress percentage bar.
* 🤖 **Tanya AI Brevet**: Floating shortcut for instant tax consultations (e.g., PPh 21 TER, PPN 11%, PTKP).

![Student Dashboard](./asset/Macbook-Air-localhost%20(7).webp)

---

### 3. 🗺️ Curriculum Learning Roadmap (`/roadmap`)

A structured, gamified learning path guiding students through Brevet A & B subjects:
* Step-by-step sequential progression from foundational tax principles to complex corporate taxes.
* Estimated completion times and bonus XP badges per module.
* Direct action buttons to start or resume module lessons.

![Learning Roadmap](./asset/Macbook-Air-localhost%20(8).webp)

---

### 4. 📖 Learning Materials Catalog & Detail Reader (`/belajar/materi`)

Students can explore topic catalogs or dive into comprehensive reading materials:
* **Story Hooks & Case Scenarios**: Engaging real-world intro hooks (e.g. salary tax deductions, dining tax receipts).
* **Legal Statute References**: Highlighted legal boxes referencing official laws (UU HPP No. 7 Tahun 2021, PMK 168/2023).
* **AI Article Explainer**: Integrated button launching Gemini AI to explain specific legal clauses in simple language.

| Catalog View | Detail Reader View |
| :---: | :---: |
| ![Catalog View](./asset/Macbook-Air-localhost%20(9).webp) | ![Detail Reader View](./asset/Macbook-Air-localhost%20(10).webp) |

---

### 5. 💼 Interactive Case Studies & Simulations (`/studi-kasus`)

Hands-on practical simulations based on real Indonesian tax disputes and filing procedures:
* ⚖️ **Sengketa Tax Disputes**: Simulation on SKP Kurang Bayar appeal procedures under UU KUP.
* 📄 **Faktur Pajak PPN**: Interactive correction of e-Faktur 4.0 errors under PER-03/PJ/2022.
* 🏢 **Rekonsiliasi Fiskal PT**: Corporate commercial-to-fiscal profit adjustments.
* 👤 **SPT 1770 WPOP**: Individual taxpayer return filing with side business income.

![Student Case Studies](./asset/Macbook-Air-localhost%20(11).webp)

---

## 👨‍💼 Admin Management Features

### 6. 📊 Admin Analytics Dashboard (`/admin/dashboard`)

High-level telemetry panel for administrators to monitor platform activity:
* **Metric Cards**: Total Registered Users, Active Modules, Evaluation Quiz Question Bank count, AI Engine Status.
* **Recent Curriculum Modules**: Overview of recently published modules.
* **Recent User Registration**: List of recently joined students.

![Admin Dashboard](./asset/Macbook-Air-localhost%20(1).webp)

---

### 7. 📚 Admin Curriculum CMS & Claude JSON Importer (`/admin/modul`)

Comprehensive curriculum management supporting rapid content generation:
* **Module CRUD**: Create, edit, publish, and delete curriculum modules.
* 📥 **Claude JSON Importer**: One-click import button allowing bulk JSON curriculum imports generated by Claude/Gemini.
* 🧪 **Compiler Button**: Live validation of module schema completeness.

![Modul CMS](./asset/Macbook-Air-localhost%20(2).webp)

---

### 8. 💼 Admin Case Study CMS (`/admin/studi-kasus`)

Dedicated manager for practical case study scenarios:
* Filter case studies by category (Sengketa, PPN, PPh Badan, PPh OP).
* Preview mode (`Pratinjau`), Edit mode (`Edit`), and publication status toggle (`Dipublikasikan`).

![Case Study CMS](./asset/Macbook-Air-localhost%20(3).webp)

---

### 9. 🤖 9-Engine AI Prompt Studio (`/admin/prompt-studio`)

Enterprise prompt engineering suite allowing real-time modification of AI prompt components:
* **9 Modular Engines**: Master System, Deep Research, Tax Reasoning, Curriculum, Pedagogy, JSON Output, Visual, Assessment, and Quality Engine.
* **Version Control**: Track revision history and edit prompt system instructions per engine.
* **Compiler Integration**: Compile all 9 engines into a unified execution prompt sent to Gemini AI.

![AI Prompt Studio](./asset/Macbook-Air-localhost%20(5).webp)

---

### 10. ⚙️ System Settings & Telemetry (`/admin/pengaturan`)

Infrastructure health and environment configuration panel:
* **Neon Database Telemetry**: Status monitoring for PostgreSQL Serverless DB.
* **Better Auth Status**: Session & role authentication state monitoring.
* **Gemini Key Rotation**: Active rotation array displaying loaded Gemini API key count (e.g. 54 Active Keys).
* **Platform Configuration**: Platform name, curriculum standard, and minimum quiz pass score (default 70%).

![System Settings](./asset/Macbook-Air-localhost%20(6).webp)

---

## 🎨 UI Design & Visual System

Pixel is crafted using modern dark-mode aesthetic principles with glowing HSL accents, clean typography, dynamic glassmorphism, and responsive sidebars:

![Sidebar Navigation](./asset/Macbook-Air-localhost%20(4).webp)
