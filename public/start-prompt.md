# Start Prompt — Cortexa Chat Platform

Use this prompt to kick off the build in your IDE (Cursor / Windsurf with Gemini).

---

## Prompt

I want to build a full-stack AI chat web application called **Cortexa** using Next.js 14 (App Router). Read the `prd.md` and `claude.md` files in this repo before writing any code — they contain the full spec, folder structure, design system, and rules.

Here is a summary of what to build and in what order:

---

### Phase 1 — Project Setup
1. Initialize the project with TypeScript, Tailwind CSS, App Router
2. Install all packages: `openai mongoose next-auth bcryptjs sonner framer-motion lucide-react`
3. Set up `tailwind.config.ts` with the custom color tokens and font families (`Syne`, `DM Sans`, `Geist Mono`) from `claude.md`
4. Create `.env.local` with placeholder values for `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `FEATHERLESS_API_KEY`
5. Create `lib/db.ts` with the singleton Mongoose connection pattern
6. Create all three Mongoose models: `User`, `Conversation`, `Settings` as defined in `claude.md`

---

### Phase 2 — Auth
1. Create `lib/auth.ts` with NextAuth credentials provider, bcrypt password check, JWT with `id` and `role`
2. Create `app/api/auth/[...nextauth]/route.ts`
3. Create `app/api/auth/register/route.ts` — validates email, hashes password, creates User document
4. Create `middleware.ts` — protects `/chat/*` and `/admin/*`, checks `role === 'admin'` for admin routes
5. Build the login page at `app/(auth)/login/page.tsx` — dark themed, Framer Motion fade-in, Sonner for errors
6. Build the register page at `app/(auth)/register/page.tsx` — same design language

---

### Phase 3 — Landing Page
Build `app/page.tsx` — a sleek dark landing page with:
- Hero section with product name, tagline, and CTA buttons (Login / Get Started)
- Features section (model selection, uncensored access, conversation history, vision support)
- Framer Motion scroll-triggered animations
- Use Syne font for headings, DM Sans for body
- Color scheme: `#080808` background, `#3B82F6` accent

---

### Phase 4 — Core Chat Layout
1. Build `app/(main)/layout.tsx` — wraps all chat pages with the sidebar and auth session provider
2. Build `components/chat/ConversationSidebar.tsx`:
   - List of conversations grouped by Today / Yesterday / Last 7 Days / Older
   - New Chat button at the top
   - Delete conversation option
   - Collapses to a drawer icon on mobile
   - Framer Motion slide-in animation
3. Build `app/(main)/chat/page.tsx` — empty state for new chat, model selector visible

---

### Phase 5 — Model Selector
1. Create `app/api/models/route.ts` — fetches from Featherless `/v1/models`, filters by admin whitelist from Settings document, returns list
2. Build `components/chat/ModelSelector.tsx`:
   - Dropdown showing model name, size, badges for `uncensored` / `abliterated` / `vision`
   - Searchable
   - Framer Motion scale dropdown animation
   - Saves selected model to user profile via API call

---

### Phase 6 — Chat Interface & Streaming
1. Create `app/api/chat/route.ts`:
   - Accepts `{ modelId, messages, imageBase64? }` in request body
   - Fetches API key from Settings DB (fallback to env)
   - Calls Featherless using `openai` package with `baseURL: 'https://api.featherless.ai/v1'`
   - Streams response back using `ReadableStream`
   - If `imageBase64` present, formats message content as array with image_url block
2. Build `components/chat/ChatInterface.tsx` — main chat area, renders message list, handles streaming token consumption with `getReader()`
3. Build `components/chat/MessageBubble.tsx` — user (right, accent bg) and assistant (left, surface bg) bubbles, copy button, markdown rendering
4. Build `components/chat/MessageInput.tsx`:
   - Textarea that grows with content
   - Send button (Lucide `SendHorizonal`)
   - Image upload button (only visible when vision model selected)
   - Image preview before sending
   - Converts image to base64 on client via FileReader
5. Create conversation API routes:
   - `POST /api/conversations` — creates new conversation, auto-titles from first message
   - `GET /api/conversations` — returns user's conversation list
   - `GET /api/conversations/[id]` — returns full conversation with messages
   - `PUT /api/conversations/[id]` — appends new messages
   - `DELETE /api/conversations/[id]` — deletes conversation
6. Wire `app/(main)/chat/[id]/page.tsx` — loads conversation from DB, renders ChatInterface with history

---

### Phase 7 — Admin Panel
1. Build `app/admin/layout.tsx` — checks role, redirects non-admins
2. Build `app/admin/page.tsx` — basic stats dashboard (user count, message count, active models)
3. Build `app/admin/settings/page.tsx` with `components/admin/SettingsForm.tsx`:
   - Input to set Featherless API key (masked)
   - Model visibility toggle list (fetched from Featherless, toggleable per model)
   - Save button with Sonner success/error toast
4. Build `app/admin/users/page.tsx` with `components/admin/UserTable.tsx`:
   - Table of all users (name, email, role, joined date)
   - Role change dropdown
   - Deactivate toggle

---

### Design Rules (apply throughout)
- Background: `#080808`, Surface: `#111111`, Border: `#1e1e1e`
- Accent: `#3B82F6`, Muted text: `#6b7280`
- Fonts: Syne (headings), DM Sans (body), Geist Mono (model names/code)
- All animations use Framer Motion — no CSS transitions for major UI elements
- Toasts use Sonner only — import `{ toast }` from `'sonner'` and add `<Toaster />` to root layout
- Icons from `lucide-react` only
- Tailwind for all styling — no inline styles, no CSS modules
- All Featherless API calls go through Next.js API routes — never from client directly

---

Start with Phase 1 and confirm completion before moving to Phase 2.
