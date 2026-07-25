# Todo List: Personal Blogging Website Frontend

## Task 1: Design System & 1600px Max-Width Layout Configuration

**Description:** Set up Tailwind CSS v4 custom color tokens for ocean blue (`#5996FF`), customize backgrounds and text typography, and implement the responsive grid wrapper with a `max-w-[1600px]` constraint for desktop views.

**Acceptance criteria:**
- React Vite application compiles and custom styling runs.
- The global styling uses `--color-primary` as `#5996FF` for brand highlights.
- The default main application wrapper has a maximum width of 1600px on desktop screens, and is centered with custom gutters on mobile/tablets.

**Verification:**
- [x] Inspect the document width on a wide screen to verify it caps at 1600px.
- [x] Verify Tailwind primary utility classes maps to ocean blue.

**Dependencies:** None

**Files likely touched:**
- `apps/frontend/src/index.css`
- `apps/frontend/src/App.tsx`

**Estimated scope:** Small (1-2 files)

---

## Task 2: Login Modal with Google OAuth & Email/Password Forms

**Description:** Replace the standalone login page with a Dialog-based Login Modal. Include inputs for email/password and a prominent "Continue with Google" button. Enable Google-only sign-up/sign-in for readers, and email/password access for creators and admins.

**Acceptance criteria:**
- Login Modal triggers globally when authentication is required (commenting, reports, AI chat).
- Google OAuth logs in and automatically registers regular readers.
- Email/password authentication is verified against `/api/auth/login`.

**Verification:**
- [x] Click login to trigger the modal, sign in via Google and verify it registers/logs in the reader.
- [x] Attempt logging in with incorrect credentials and verify the error message is displayed.

**Dependencies:** Task 1

**Files likely touched:**
- `apps/frontend/src/components/LoginModal.tsx` (new)
- `apps/frontend/src/context/ThemeContext.tsx` or similar auth contexts.
- `apps/frontend/src/pages/Login.tsx` (removed / refactored)

**Estimated scope:** Medium (3-5 files)

---

## Task 3: Axios Client Configuration with Auto Refresh Interceptor

**Description:** Configure the global Axios instance with request/response interceptors to automatically append JWT bearer headers and handle `401` unauthorized responses by requesting a new access token via `/api/auth/refresh`.

**Acceptance criteria:**
- Every API call has authorization header attached if `accessToken` exists in localStorage.
- If an API call fails with 401, the client automatically requests a refreshed access token and retries the original request.
- If refresh fails, it clears localStorage credentials and triggers a logout event.

**Verification:**
- [x] Spoof an expired token, trigger an API request, and inspect network logs to verify `/refresh` is called and the original request is retried.

**Dependencies:** Task 2

**Files likely touched:**
- `apps/frontend/src/api/client.ts`

**Estimated scope:** XS (1 file)

---

## Task 4: Homepage with Spotlight Grid & Dynamic Collections

**Description:** Update the homepage to retrieve collections dynamically. Fetch the first 3 collections via `/api/collections` and render them in the "Curated Learning Roadmaps" cards. Display the editorial spotlight post and trending list cards.

**Acceptance criteria:**
- The first 3 collections are fetched dynamically and replace hardcoded cards.
- Clicking "View Series →" redirects the user to `/blog?collection=<id>` to filter posts.
- Editorial highlight post details are displayed correctly.

**Verification:**
- [x] Open homepage and check that the collections match the database seed data.
- [x] Click "View Series →" and verify it redirects to the correctly filtered feed page.

**Dependencies:** Task 3

**Files likely touched:**
- `apps/frontend/src/pages/Home.tsx`

**Estimated scope:** Small (1-2 files)

---

## Task 5: Blog Archive Feed with Searching & Tag/Collection Filters

**Description:** Implement the Blog archive listing page. Support searching posts by keyword and filtering by active tag and collection identifiers, complete with paginated post retrieval.

**Acceptance criteria:**
- Archive page correctly maps query parameters to search parameters.
- Lists published posts matching search criteria.
- Search input dynamically updates the list.

**Verification:**
- [x] Search for a post title and verify matching cards load.
- [x] Filter by tag and check if the search lists only corresponding posts.

**Dependencies:** Task 3, Task 4

**Files likely touched:**
- `apps/frontend/src/pages/Blog.tsx`

**Estimated scope:** Small (1-2 files)

---

## Task 6: Article Details Page & Interactive Comment Section

**Description:** Build the Post Detail page which renders markdown contents safely. Add the Comment Section allowing authenticated readers to create/delete comments, and the Report Modal to submit abuse reports.

**Acceptance criteria:**
- Article body renders Markdown securely with DOMPurify.
- Comments section displays comments; lets USERs add comments and delete their own.
- Open Report Modal from the page to submit reports to the backend.

**Verification:**
- [x] View a post, verify code blocks are highlighted.
- [x] Write a comment as logged-in user, and verify a guest can only see a Google login CTA.

**Dependencies:** Task 3, Task 5

**Files likely touched:**
- `apps/frontend/src/pages/PostDetail.tsx`
- `apps/frontend/src/components/CommentSection.tsx`
- `apps/frontend/src/components/ReportModal.tsx`

**Estimated scope:** Medium (3-5 files)

---

## Task 7: Permanent Floating AI Chatbot Widget

**Description:** Build the persistent AI chat widget in the bottom-right corner. Handle localStorage session tracking, message history fetching, and contextual grounding by automatically appending `activePostId` when user is reading an article.

**Acceptance criteria:**
- Chat widget bubble is always visible.
- Guest click opens a popover requesting Google sign-in.
- User chat messages are sent and responses received with typing loading indicators.

**Verification:**
- [x] Open the widget as guest and verify it prompts for Google login.
- [x] Log in, start chatting, read a specific article, and verify questions about "this post" query the correct context.

**Dependencies:** Task 2, Task 6

**Files likely touched:**
- `apps/frontend/src/components/ChatWidget.tsx`

**Estimated scope:** Medium (3-5 files)

---

## Task 8: Profile & Settings Page for Password and Email Updates

**Description:** Implement `/profile` settings page allowing logged-in users to update display names, request email changes, and set/update their account passwords (allowing Google users to establish email login access).

**Acceptance criteria:**
- User can update nickname or name.
- Input fields allow setting an initial password.
- Triggers change email workflow sending verification emails.

**Verification:**
- [x] Login via Google, navigate to `/profile`, set a password, logout, and verify you can now sign in using that email and the new password.

**Dependencies:** Task 2

**Files likely touched:**
- `apps/frontend/src/pages/Profile.tsx` (new)

**Estimated scope:** Small (1-2 files)

---

## Task 9: Account Verification & Password Reset Redirect Pages

**Description:** Build standalone routing views for `/verify` and `/reset-password` pages to handle user activation email redirects and password updates using tokens.

**Acceptance criteria:**
- `/verify` reads `code` parameter, queries backend verify route, and shows status.
- `/reset-password` renders password setting form and calls backend change password endpoint.

**Verification:**
- [x] Test the verification link and verify it prompts success and redirects to homepage showing login modal.

**Dependencies:** Task 2

**Files likely touched:**
- `apps/frontend/src/pages/Verify.tsx` (new)
- `apps/frontend/src/pages/ResetPassword.tsx` (new)

**Estimated scope:** Small (1-2 files)

---

## Task 10: Manager Dashboard & Full-Screen Visual Post Editor

**Description:** Build the post list table and visual TipTap editor for Creators. Include a toggle button for distraction-free mode (hiding app shell borders) and direct image uploads via signature retrieval.

**Acceptance criteria:**
- Table displays posts with Draft/Published markers.
- Distraction-Free mode hides navigation panels.
- Media uploader inserts signed Cloudinary images into TipTap.

**Verification:**
- [x] Toggle distraction-free mode to ensure sidebar slides away.
- [x] Insert an image to verify signature is fetched and direct Cloudinary upload succeeds.

**Dependencies:** Task 3, Task 6

**Files likely touched:**
- `apps/frontend/src/pages/ManagerDashboard.tsx`
- `apps/frontend/src/pages/PostEditor.tsx`

**Estimated scope:** Large (5-8 files)

---

## Task 11: Admin Dashboard for Moderation and User Creation

**Description:** Implement Admin moderation pages for managing abuse reports, checking comments visibilities (toggling status), and creating new Manager accounts.

**Acceptance criteria:**
- Forms allow registering manager accounts.
- Moderation tables allow toggling comment status and resolving/canceling reports.

**Verification:**
- [x] Create a manager account and check database.
- [x] Hide a comment and verify public details page no longer displays it.

**Dependencies:** Task 3, Task 6

**Files likely touched:**
- `apps/frontend/src/pages/AdminDashboard.tsx`

**Estimated scope:** Medium (3-5 files)
