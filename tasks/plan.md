# Implementation Plan: Personal Blogging Website Frontend

This plan outlines the steps to build the modern React SPA Frontend, integrating with the Hono backend API, using the visual theme of the Figma design.

## Overview
We will build a high-performance, fully responsive React Single Page Application (SPA) using React 19, Vite, Tailwind CSS v4, and Shadcn UI. The theme is based on the ocean blue color (`#5996FF`) and white background, with a desktop max-width of `1600px`. Authentication is modal-based (Login Modal handles Google login for USERs and Email/Password for Admin/Managers), and the AI chat widget remains permanently floating in the bottom-right corner.

---

## Architecture Decisions
- **Framework & Build**: React 19, TypeScript, Vite 6, Bun runtime.
- **Styling**: Tailwind CSS v4 configured natively with the `@tailwindcss/vite` plugin.
- **Components**: Shadcn UI (Radix primitives styled with custom classes).
- **Primary Theme Color**: Ocean blue `#5996FF` (`--color-primary`) as the primary brand color.
- **Responsive Width Grid**: Max-width of `1600px` for desktop, collapsing cleanly into tablet (2 columns) and mobile (single column) views.
- **Routing**: React Router Dom v7.
- **API Client**: Axios instance with request/response interceptors to attach access token and perform token refresh.
- **Popups/Modals**: Login/Register modal-based flow. Removes public registration page in favor of Google OAuth automatic registration.

---

## Task List

### Phase 1: Setup, Theme & Authentication Modal
- [x] **Task 1**: Configure Tailwind v4 Theme Tokens and Max-Width Grid Layout (1600px wrapper)
- [x] **Task 2**: Implement Login Modal with Google OAuth & Email/Password Forms
- [x] **Task 3**: Setup Token Storage & Auto-Refresh Axios Client

### Checkpoint: Authentication & Theme
- [x] React SPA builds and renders on localhost:5173.
- [x] Theme variables (primary ocean blue `#5996FF` and custom grids) are verified.
- [x] Login Modal launches, logs in via Google and stores session tokens, and closes seamlessly.

### Phase 2: Public User Views & Chatbot Widget
- [x] **Task 4**: Homepage Development with Dynamic Collection Grid & Spotlight Post
- [x] **Task 5**: Blog Archive Feed with Paginated Searching & Tags/Collection Filters
- [x] **Task 6**: Article Detail Page with Rendered HTML/Markdown & Comment Section
- [x] **Task 7**: Persistent Floating AI Chatbot Widget with Google Login Popup for Guests

### Checkpoint: Reader Flow
- [x] Homepage correctly displays the first 3 dynamic collections retrieved from `/api/collections`.
- [x] Guest readers can browse posts, search, and filter by tags/collections.
- [x] Blog detail page renders HTML safely and supports commenting for logged-in users.
- [x] AI Chatbot widget remains fixed in the bottom-right; guests are prompted with a Google login modal, while users can chat and automatically send `activePostId` context.

### Phase 3: Profile Management & Verification Flow
- [x] **Task 8**: User Profile Page for Nickname Updates & Initial Password Setup
- [x] **Task 9**: Account Verification (`/verify`) & Password Reset (`/reset-password`) Pages

### Checkpoint: User Operations
- [x] Users registered via Google can configure an email password on `/profile`.
- [x] Newly registered managers can verify their email address on `/verify?code=...`.
- [x] Reset password page successfully processes `POST /api/auth/change-password` with token.

### Phase 4: Dashboards & Moderation
- [x] **Task 10**: Manager Dashboard with Table & TipTap Editor (Distraction-Free Focus Mode)
- [x] **Task 11**: Admin Dashboard with Reports Moderation, Comments Toggle, and Manager Creation

### Checkpoint: Complete
- [x] Manager can write posts in full-screen distraction-free mode and upload banners to Cloudinary.
- [x] Admin can create manager accounts and toggle comment statuses.
- [ ] Full end-to-end user testing completes.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Token expiration loop** | Medium | Axios response interceptor intercepts 401, calls `/api/auth/refresh`, updates tokens in localStorage, and retries the original request. |
| **Cloudinary direct uploads** | High | Always retrieve upload signature from backend first, then execute direct REST upload to Cloudinary to bypass proxying files through Hono. |
| **Unauthenticated AI chat abuse** | Low | UI must validate auth state before enabling the send button or loading history, showing a Google auth popup prompt immediately. |
