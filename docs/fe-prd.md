# Spec: blogging-website-frontend (FE PRD)

## Objective
Design and implement a modern, responsive, and performance-optimized Frontend for the Personal Blogging Website. The frontend must integrate seamlessly with the existing Hono/Cloudflare Workers Backend API.

Using MCP to review this Figma design: 
https://www.figma.com/design/qGveQS5j2mojQjD8DwrUmh/Blogging-Website-UI--Community---Community-?node-id=0-1&p=f&t=LJCzVI0od6TDOzH4-0
about the layout and design

### User Stories & Roles
1. **Reader (Guest)**:
   - Browse the homepage and view published blog posts.
   - Filter posts by tag, search by keyword, or filter by collection.
   - Read full articles in high-quality typography (HTML/Markdown rendered).
   - If they try to chat with the AI or post a comment, they must be presented with the **Login Modal** offering Google Sign-In.
2. **Reader (Logged In - `Role.USER`)**:
   - Access the persistent **AI Chat Widget** (floats in the bottom-right corner) with chat history saved in SQLite by session code.
   - Write, edit, and delete their own comments under articles.
   - Flag abusive posts or comments via the **Report Modal**.
   - Edit their profile to change their name/nickname and **set a password** (enabling email/password login from then on).
3. **Content Creator (`Role.MANAGER`)**:
   - Access the **Manager Dashboard** (`/manager`) to see their own posts (Drafts and Published).
   - Create and edit articles using a rich text editor (TipTap) featuring a togglable **Distraction-Free Mode** (hides navigation/sidebars).
   - Upload banners and inline images directly to Cloudinary using backend-signed signatures.
4. **System Administrator (`Role.ADMIN`)**:
   - Access the **Admin Dashboard** (`/admin`) to register new Manager accounts.
   - Moderation: Toggle comment visibility (`active` / `invalid`).
   - Moderation: View, dismiss, or resolve abuse reports (flagging posts/comments).

---

## Required Pages
The frontend application requires the following pages to support all user roles and integration flows with the Hono backend:

1. **Home Page (`/`)**:
   - Modern broadsheet landing view with a Hero introduction.
   - Dynamic layout displaying editorial spotlight posts and trending lists.
   - Reusable **Subscribe Form** widget.
   - Category card grid showing the popular collections with article count.

2. **Blog Feed Page (`/blog`)**:
   - Lists published posts with search input and pagination controls.
   - Handles query parameters (`?tag=`, `?collection=`, `?keyword=`) to filter and search posts.

3. **Blog Detail Page (`/posts/:slugOrId`)**:
   - Displays the single article title, banner image, author info, published date, and full HTML/Markdown body.
   - Includes the **Comment Section** component at the bottom.
   - Provides a "Report" button to open the **Report Modal**.

4. **Manager Dashboard (`/manager`)**:
   - Accessible to `Role.MANAGER` and `Role.ADMIN`.
   - Displays a clean data table listing their own posts (Drafts/Published).
   - Allows changing profile info (Name, Nickname).
   - Provides options to create a new post or edit/delete existing drafts/posts.

5. **Visual Post Editor (`/manager/editor/:postId?`)**:
   - Rich interactive TipTap editor.
   - Focus Mode / Distraction-free View toggle.
   - Media uploader with Cloudinary auto-signature creation.

6. **Admin Dashboard (`/admin`)**:
   - Accessible only to `Role.ADMIN`.
   - Moderation tools: Abuse reports table (solved, pending, cancel) and Comments table (active, invalid).
   - Creation form for registering new Manager accounts.

7. **Profile / Settings Page (`/profile`)**:
   - Accessible to logged-in users.
   - Allows users to change their display name and nickname.
   - Provides fields for setting up an initial password (crucial for USERs who registered via Google and want email/password login access) or changing passwords.
   - Triggers email change flow via `/api/auth/change-email`.

8. **Account Verification Page (`/verify`)**:
   - Matches the email verification URL `{FE_URL}/verify?code={verifyToken}`.
   - Calls backend `/api/auth/verify?code={code}` on render.
   - Shows status (loading, success, error) and guides users to the Login Modal.

9. **Reset Password Page (`/reset-password`)**:
   - Matches the forgot-password redirect URL `{FE_URL}/reset-password?token={resetToken}`.
   - Renders a secure form to input a new password and calls backend `POST /api/auth/change-password` using the token.

---

## Tech Stack
* **Framework**: React 19 (Vite-based Single Page Application)
* **Routing**: React Router Dom v7
* **Styling**: Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin)
* **Components**: Custom UI components based on Tailwind utilities, with Radix UI primitives if needed (e.g. Dialog/Modal, Popover). Using Shadcn UI to have a consistency UI. 
* **HTTP Client**: Axios (configured with request/response interceptors to attach JWT and handle auto-refresh tokens on `401`).
* **Rich Text Editor**: TipTap (React wrapper with starter kit and Image extension)
* **Markdown Rendering**: Marked + DOMPurify (for sanitizing rendered HTML against XSS)
* **Google Auth**: `@react-oauth/google` (verifying token via backend `/api/auth/login-google`)
* **Icons**: Lucide React
* **Build Tool**: Bun + Vite 6

---

## Commands
Execute commands from the `/apps/frontend` directory:
* **Dev Server**: `bun run dev` (starts dev server on port 5173, proxying `/api` to port 8787)
* **Production Build**: `bun run build` (runs typechecking and Vite build)
* **Linting**: `bun run lint` (runs `oxlint` for fast analysis)
* **Preview Production**: `bun run preview` (previews locally built bundle)

---

## Project Structure
```
apps/frontend/
├── src/
│   ├── api/
│   │   ├── client.ts         # Axios instance with JWT & token refresh interceptors
│   │   ├── auth.ts           # Authentication API calls
│   │   ├── post.ts           # Post, Tag, and Collection API calls
│   │   ├── admin.ts          # Moderator comments/reports & manager registry calls
│   │   └── subscriber.ts     # Subscriber form API calls
│   ├── components/
│   │   ├── ui/               # Reusable primitive components (Button, Input, Card, Dialog)
│   │   ├── ChatWidget.tsx    # Floating persistent AI Chat Widget
│   │   ├── CommentSection.tsx# Comments container (post/edit/delete/report comments)
│   │   ├── ReportModal.tsx   # Modal to file post/comment abuse reports
│   │   ├── SubscribeModal.tsx# Newsletter signup dialog
│   │   └── PostCard.tsx      # Grid element representing an article summary
│   ├── context/
│   │   └── ThemeContext.tsx  # Light/Dark mode state management
│   ├── hooks/
│   │   ├── useAuth.ts        # Custom hook for getting/updating session states
│   │   └── useToast.ts       # Global notification service
│   ├── pages/
│   │   ├── Home.tsx          # Homepage showing featured grids and collection filters
│   │   ├── Blog.tsx          # Articles feed list with tagging and search input
│   │   ├── PostDetail.tsx    # Complete article view with comments and report buttons
│   │   ├── PostEditor.tsx    # TipTap visual editor with focus distraction-free view
│   │   ├── ManagerDashboard.tsx # Manager posts manager table & profile credentials editor
│   │   └── AdminDashboard.tsx   # Admin moderation portal (Reports, Comments, Accounts creation)
│   ├── types/
│   │   └── post.ts           # TypeScript interfaces for Post, Tag, Collection, User
│   ├── App.tsx               # Route layout and AuthState provider wrapper
│   ├── index.css             # Main styling entry using Tailwind CSS variables
│   └── main.tsx              # React client bootstrapping
├── components.json           # Shadcn/ui configurations (if utilized)
├── vite.config.ts            # Vite configuration with API proxy definitions
├── tsconfig.json             # Root TypeScript config
└── package.json              # Client dependencies and execution scripts
```

---

## Code Style
We follow standard React and TypeScript conventions. CSS uses Tailwind CSS v4 variables.

### React Component Style Example
```tsx
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface SubscribeFormProps {
  onSubscribe: (email: string) => Promise<void>;
}

export const SubscribeForm: React.FC<SubscribeFormProps> = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await onSubscribe(email.trim());
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="email"
        placeholder="Enter your email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-white">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
      </Button>
    </form>
  );
};
```

### Visual Themes & Design Tokens
* **Primary Color (Ocean Blue)**: `#5996FF` (Tailwind class `bg-[#5996FF]`, variable `--color-primary`) is the dominant color for buttons, interactive states, active tab indicators, and link hovers.
* **Canvas Background**: Light mode uses clean `#FFFFFF` with sleek grid alignments and subtle borders. Dark mode adapts to card-based dark grays.
* **Layout Dimensions (1600px Grid)**:
  - Desktop view is optimized for modern high-resolution displays using a maximum content container width of **1600px** (`max-w-[1600px]`) for a wide, clear, and easy-to-read broadsheet layout.
  - Fully responsive behavior: Automatically cascades down to custom grid/flex layouts on Tablet (e.g., 2 columns, padded margins) and Mobile (single-column, full-width layouts).
* **AI Chatbot Bubble**:
  - The AI assistant Chatbot bubble **always remains visible** at the bottom-right corner of all user-facing pages.
  - Clicking the bubble triggers the chat interface (initiating / loading context-grounded conversation for USERs, or displaying the Google login prompt popover for Guests).
* **Glassmorphism**: Header and sticky floating widgets use `backdrop-blur-md bg-white/80 dark:bg-card/80` borders.
* **Typography**: Clean variable sans-serif font (e.g., Geist) configured with comfortable line heights (`leading-relaxed` to `leading-loose`) and wide text margins to optimize text legibility.

---

## Testing Strategy
We focus primarily on functional manual verification and developer preview builds.
* **Build Verification**: Make sure there are no compile-time TypeScript errors or configuration errors before committing changes.
* **Component Testing**: Add unit/integration tests as the project scales.

---

## Boundaries

* **Always**:
  - Run `bun run build` to verify types and compilation before commits.
  - Store tokens (`accessToken`, `refreshToken`) securely in `localStorage` and handle their lifecycle.
  - Validate inputs (email format, post title presence, slug formats) on the client before making network requests.
* **Ask First**:
  - Adding new third-party NPM packages not present in the package JSON.
  - Making changes to global state providers or context configurations.
* **Never**:
  - Commit API keys or client secrets to source control.
  - Directly upload images to third-party assets without getting backend signatures from the `/api/posts/upload` endpoint first.
  - Bypass authentication filters on routes that require role check.

---

## Success Criteria

1. **Integrated Login Modal**:
   - The standalone login page is replaced/refactored into a Modal.
   - Users are offered Email/Password inputs (with clear helper text for Managers/Admins) and a "Continue with Google" button.
   - Seamless token validation on success, closing the Modal and refetching states without full-page reloads.
2. **Dynamic Collection Filters**:
   - The homepage section "Curated Learning Roadmaps" fetches and displays the first 3 collections dynamically from the database.
   - The cards link to `/blog?collection=<id>` and update the filtering layout.
3. **AI Chat Widget**:
   - The chatbot bubble is always visible at the bottom-right corner of all user-facing screens.
   - User session management works (creating sessions, saving codes in localStorage, fetching logs).
   - Sends `activePostId` parameter when reading an article to ground conversational questions.
   - Properly handles unauthenticated guest clicks by prompting a clean popup/popover requiring Google login.
4. **Manager WYSIWYG Editor**:
   - TipTap integration works, including direct banner and inline image uploads using the backend signature signature endpoint.
   - Distraction-Free Mode toggle works by hiding sidebar widgets and app navigation layouts.
5. **Admin Moderation Flows**:
   - Abuse reports management, comment hidden/invalid triggers, and creator credentials creation work from the admin portal.

---

## Open Questions

None. (All authentication constraints, color palettes, and workflow paths have been clarified and verified during the interview phase.)
