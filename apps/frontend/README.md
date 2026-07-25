# 💻 Cloudian Blog - Frontend Client

<div align="center">

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Vite](https://img.shields.io/badge/Vite-64748B?style=for-the-badge&logo=vite&logoColor=FFD62B)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=F024B6)](https://framer.com/motion)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 🔍 Overview

This is the frontend client for **Cloudian Blog**, a modern blogging ecosystem. It is a client-side Single Page Application (SPA) built using **React 19**, **TypeScript**, and **Vite**, with high-performance styling powered by **Tailwind CSS**.

The client implements clean architecture, modular split components, dynamic layout loaders, responsive designs for both web and mobile displays, and rich animations using **Framer Motion**.

---

## 🛠️ Key Features

- **Dashboard Panel:** Custom moderation interfaces for Administrators (report ticket handling, comment visibilities, manager account creations) and Creators/Managers (draft/publish listings, visual metrics).
- **TipTap Rich Text Editor:** A robust, distraction-free visual post editor supporting signed image uploads, custom layouts, headers styling, and markdown editing.
- **Floating AI Assistant:** A persistent context-aware chatbot widget utilizing global reading parameters (`activePostId`) to answer questions dynamically based on the active blog.
- **Smooth Page Motion:** Premium spring-based enter transitions and staggered scroll-reveal animations using **Framer Motion**.
- **Responsive Layouts:** Floating drawers sidebar for mobile dashboards, and collapsible dropdown hamburger menus for mobile navigation.
- **Account Verification & Recovery:** Unified pages mapping token parameters to handle account activations (`/verify?code=...`) and forgot-password resets (`/reset-password?token=...`).

---

## 🚀 How to Setup and Run Locally

### 📋 Prerequisites
Ensure you have [Bun](https://bun.sh) installed.

### 1. Install Workspace Dependencies
If you haven't installed dependencies at the root of the monorepo, run:
```bash
bun install
```

### 2. Configure Environment Variables
Create a `.env` file in `apps/frontend/` with the following variables:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Start Development Server
Run the local Vite development server:
```bash
bun --filter frontend dev
```
The application will start running at `http://localhost:5173`.

### 4. Build for Production
Create an optimized production bundle:
```bash
bun --filter frontend build
```

---

## 📦 Deployment Configuration

This project includes a **[vercel.json](vercel.json)** routing config at the root of the frontend module. This resolves client-side routes (e.g. `/dashboard` or `/posts/:id`) on refresh by automatically rewriting all incoming requests to `index.html`.

Build with Cloudian 💙 Cloud - 2026
