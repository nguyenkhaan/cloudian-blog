# API Integration Product Requirements Document (PRD)

## 1. Overview
This document outlines the requirements and implementation details for integrating the mock frontend API layer of the **Cloudian Blog** application with its actual **Hono / Cloudflare Workers** backend.

### Key Goals:
- Transition from mock data to actual SQLite/D1 database calls via Hono endpoints.
- Ensure strict type safety and data alignment between system layers.
- Maintain minimal modification footprint on both existing Frontend UI and Backend APIs.
- Optimize payload transfers to prioritize bandwidth efficiency and response speed.

---

## 2. Data Model Mapping (Post ↔ Blog)
The frontend refers to the main reading entity as a `Blog` (or `Post`), whereas the database and backend APIs represent it as a `Post`.

| Frontend Field (`Post` / `PostDetail` Types) | Backend Field (`PostModel` Database) | Notes |
| :--- | :--- | :--- |
| `id` (number) | `id` (integer) | Primary Key |
| `title` (string) | `title` (text) | |
| `slug` (string) | `slug` (text) | Used in URLs |
| `content` (string) | `content` (text) | Markdown text body |
| `summary` (string) | `summary` (text) | Truncated description |
| `banner` (string) | `banner` (text) | Cloudinary banner URL |
| `publishedAt` (string \| null) | `publishedAt` (timestamp \| null) | If null, represents a Draft |
| `author` (`{ name: string, nickName: string }`) | `author` (relation to `UserModel`) | Resolved via SQL Join |
| `tags` (`Tag[]`) | `postTags` (relation to `TagModel` table) | Resolved via SQL Join |
| `collections` (`Collection[]`) | `postCollections` (relation to `CollectionModel`) | Resolved via SQL Join |

---

## 3. Page-to-Endpoint Mapping

### 3.1 Home Page (`Home.tsx`)
- **Get Recent Blogs:**
  - **Frontend Client Function:** `getPostsApi({ limit: 10 })`
  - **Backend Endpoint:** `GET /api/posts?limit=10`
  - **Request Payload:** Query parameters `?limit=10`
  - **Response Format:** Array of posts `Post[]`
- **Newsletter Subscription:**
  - **Frontend Client Function:** `subscribeApi(data: { email: string, name: string })`
  - **Backend Endpoint:** `POST /api/subscribers`
  - **Request Payload:** JSON `{ email, name }`
  - **Response Format:** `{ success: boolean, subscriber: { id, email, name } }`

### 3.2 Blog List Page (`Blog.tsx`)
- **Get Filtered Blogs:**
  - **Frontend Client Function:** `getPostsApi({ tag, collection, keyword })`
  - **Backend Endpoint:** `GET /api/posts`
  - **Request Payload:** Query parameters `?tag=...&collection=...&keyword=...`
  - **Response Format:** Array of posts `Post[]`
- **Get Available Collections:**
  - **Frontend Client Function:** `getCollectionsApi()`
  - **Backend Endpoint:** `GET /api/collections`
  - **Response Format:** Array of collections `Collection[]`
- **Get Available Tags:**
  - **Frontend Client Function:** `getTagsApi()`
  - **Backend Endpoint:** `GET /api/tags`
  - **Response Format:** Array of tags `Tag[]`

### 3.3 Post Detail Page (`PostDetail.tsx`)
- **Get Single Blog Details:**
  - **Frontend Client Function:** `getPostDetailApi(slugOrId)`
  - **Backend Endpoint:** `GET /api/posts/:slugOrId`
  - **Response Format:** Single post object `PostDetail`
- **Get Blog Comments:**
  - **Frontend Client Function:** `getCommentsApi(postId)`
  - **Backend Endpoint:** `GET /api/comments/post/:postId`
  - **Response Format:** Array of active comments `Comment[]`
- **Post a Comment:**
  - **Frontend Client Function:** `createCommentApi(postId, content)`
  - **Backend Endpoint:** `POST /api/comments/post/:postId`
  - **Request Payload:** JSON `{ content }`
  - **Response Format:** `{ success: boolean, comment: Comment }` (Note: Backend currently returns `{ success: true, commentId: number }`, we must map or align this).
- **Report Content:**
  - **Frontend Client Function:** `createReportApi(data: { title, content, entity })`
  - **Backend Endpoint:** `POST /api/reports`
  - **Request Payload:** JSON `{ title, content, entity }`
  - **Response Format:** `{ success: boolean, reportId: number }`

### 3.4 Blog Editor Page (`PostEditor.tsx`)
- **Create New Post:**
  - **Frontend Client Function:** `createPostApi(data)`
  - **Backend Endpoint:** `POST /api/posts`
  - **Request Payload:** JSON matching `CreatePostDto`
- **Update Existing Post:**
  - **Frontend Client Function:** `updatePostApi(postId, data)`
  - **Backend Endpoint:** `PUT /api/posts/:postId`
  - **Request Payload:** JSON matching `UpdatePostDto`
- **Get Upload Signature for Cloudinary:**
  - **Frontend Client Function:** `getUploadSignatureApi()`
  - **Backend Endpoint:** `POST /api/posts/upload`
  - **Response Format:** `{ signature, timestamp, folder }`

### 3.5 Dashboard Panel (`Dashboard.tsx`)
- **Admin - View All Reports:**
  - **Frontend Client Function:** `getReportsApi({ status, entity })`
  - **Backend Endpoint:** `GET /api/reports`
  - **Request Payload:** Query parameters `?status=...&entity=...`
- **Admin - Solve or Cancel Report:**
  - **Frontend Client Function:** `updateReportStatusApi(reportId, status, resolutionNote)`
  - **Backend Endpoint:** `POST /api/reports/:reportId/status`
  - **Request Payload:** JSON `{ status, resolutionNote }`
- **Admin - View System Comments:**
  - **Frontend Client Function:** `getAllCommentsApi({ status })`
  - **Backend Endpoint:** `GET /api/comments`
  - **Request Payload:** Query parameters `?status=...`
- **Admin - Moderate Comment Status:**
  - **Frontend Client Function:** `updateCommentStatusApi(commentId, status)`
  - **Backend Endpoint:** `PUT /api/comments/:commentId/status`
  - **Request Payload:** JSON `{ status }`
- **Admin - Register New Manager Account:**
  - **Frontend Client Function:** `registerApi(data)`
  - **Backend Endpoint:** `POST /api/auth/register` (Requires Admin Access Token)
  - **Request Payload:** JSON `{ email, name, password, nickName }`
- **Manager - View Self Draft/Published Blogs:**
  - **Frontend Client Function:** `getManagerPostsApi()`
  - **Backend Endpoint:** `GET /api/posts/me` (Requires Manager Access Token)
- **Manager/Admin - Delete Blog:**
  - **Frontend Client Function:** `deletePostApi(postId)`
  - **Backend Endpoint:** `DELETE /api/posts/:postId`
- **Manager/Admin - Change Blog Status (Draft/Publish):**
  - **Frontend Client Function:** `updatePostStatusApi(postId, status)`
  - **Backend Endpoint:** `PATCH /api/posts/:postId/status`
  - **Request Payload:** JSON `{ status }`

### 3.6 Authentication (`AuthContext.tsx`, `Verify.tsx`, `ResetPassword.tsx`)
- **Local Login:**
  - **Frontend Client Function:** `loginLocalApi(email, password)`
  - **Backend Endpoint:** `POST /api/auth/login`
- **Google Login:**
  - **Frontend Client Function:** `loginWithGoogleApi(idToken)`
  - **Backend Endpoint:** `POST /api/auth/login-google`
- **Account Verification:**
  - **Frontend Client Function:** `verifyAccountApi(code)`
  - **Backend Endpoint:** `GET /api/auth/verify?code={code}`
- **Password Reset:**
  - **Frontend Client Function:** `changePasswordApi(password, token)`
  - **Backend Endpoint:** `POST /api/auth/change-password?token={token}`

### 3.7 AI Chat widget (`ChatWidget.tsx`)
- **Initialize Session:**
  - **Frontend Client Function:** `createChatSessionApi()`
  - **Backend Endpoint:** `POST /api/chat/session`
- **Load Messages History:**
  - **Frontend Client Function:** `getSessionMessagesApi(code)`
  - **Backend Endpoint:** `GET /api/chat/sessions/:code/messages`
- **Send Message:**
  - **Frontend Client Function:** `sendChatMessageApi({ sessionCode, content, activePostId })`
  - **Backend Endpoint:** `POST /api/chat/message`

---

## 4. Required Backend Adjustments

We identified two major issues on the backend that need code changes to properly support the frontend:

### 4.1 Missing Fields in `getDetailPost` (`apps/backend/src/service/post.service.ts`)
- **Problem:** The `getDetailPost` database query currently omits `banner` and `publishedAt` fields from its select columns. This prevents the frontend from displaying custom banners or publication timestamps on single post pages.
- **Solution:** Add `banner: true` and `publishedAt: true` to the selected fields in [post.service.ts](file:///home/cloud/workspace/web/blogging-website/apps/backend/src/service/post.service.ts#L155-L162).

### 4.2 Inverted Defaults in `GetAllPostsQuery` Zod Schema (`apps/backend/src/schema/post.schema.ts`)
- **Problem:** The `GetAllPostsQuery` validator defaults `limit` to `0` and `offset` to `10`. This is buggy because a database query with `.limit(0)` yields 0 records, causing empty lists. All other backend schemas use a standard default of `limit = 10` and `offset = 0`.
- **Solution:** Modify `apps/backend/src/schema/post.schema.ts` to set `limit` default to `10` (or `20`) and `offset` default to `0`.

---

## 5. API Optimization Recommendations
- **Minimize Response Payloads:** Avoid sending full post bodies when fetching listings (e.g. `GET /api/posts` returns summaries, titles, slugs, and banners but omits the full `content` column). The backend Drizzle query already performs this optimization since `getAllPost` selects specific columns and omits `PostModel.content`.
- **Axios HTTP Client Reuse:** Always use the configured Axios client in [client.ts](file:///home/cloud/workspace/web/blogging-website/apps/frontend/src/api/client.ts) to gain request interceptor (attaching Authorization Headers) and response interceptor (handling 401 token refreshes) capabilities.

---

## 6. Integration Checklist
- [ ] Implement backend fixes (adding missing columns to `getDetailPost`, correcting schema limits/offsets defaults).
- [ ] Connect Authentication APIs (`loginLocal`, `loginGoogle`, `register`, `verify`, `changePassword`).
- [ ] Connect Blog APIs (`getPosts`, `getPostDetail`, `createPost`, `updatePost`, `deletePost`, `getCollections`, `getTags`, `getUploadSignature`).
- [ ] Connect Comments & Reports APIs (`getComments`, `createComment`, `updateComment`, `deleteComment`, `getReports`, `updateReportStatus`).
- [ ] Connect Subscriber APIs (`subscribe`, `unsubscribe`, `getAllSubscribers`, `sendNewsletter`).
- [ ] Connect AI Assistant Chat APIs (`createSession`, `getMessages`, `sendMessage`).
- [ ] Run full workspace end-to-end regression tests.
