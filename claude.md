# CLAUDE.md — Cortexa Chat Platform

## Project Summary
A Next.js 14 AI chat platform powered by the Featherless AI API (OpenAI-compatible). Users authenticate, select from thousands of open-source models, chat with text and images, and have their conversations persisted in MongoDB. An admin panel controls API keys, model visibility, and users.

---

## Repository Structure
```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── chat/
│   │   │   ├── page.tsx              # new chat
│   │   │   └── [id]/page.tsx         # existing conversation
│   │   └── layout.tsx                # sidebar + auth guard
│   ├── admin/
│   │   ├── layout.tsx                # admin guard
│   │   ├── page.tsx                  # dashboard
│   │   ├── settings/page.tsx
│   │   └── users/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── chat/route.ts             # streaming endpoint
│   │   ├── models/route.ts
│   │   ├── conversations/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── admin/
│   │       ├── users/[id]/route.ts
│   │       └── settings/route.ts
│   ├── layout.tsx                    # root layout
│   └── page.tsx                      # landing page
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ModelSelector.tsx
│   │   └── ConversationSidebar.tsx
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   └── SettingsForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── db.ts                         # MongoDB connection
│   ├── models/
│   │   ├── User.ts
│   │   ├── Conversation.ts
│   │   └── Settings.ts
│   ├── auth.ts                       # NextAuth config
│   ├── featherless.ts                # Featherless API client
│   └── utils.ts
├── middleware.ts                     # route protection
├── .env.local
└── tailwind.config.ts
```

---

## Environment Variables
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
FEATHERLESS_API_KEY=your-featherless-key
```

The `FEATHERLESS_API_KEY` in `.env.local` is the default key. Admin can override it via the settings panel (stored encrypted in DB). All Featherless calls go through `/api/chat` — the key is never sent to the client.

---

## Key Implementation Rules

### Auth
- Use NextAuth.js with credentials provider
- Hash passwords with bcrypt (saltRounds: 12)
- JWT strategy, include `id` and `role` in token
- Middleware protects `/chat/*` and `/admin/*` routes
- Admin routes additionally check `role === 'admin'`

### Featherless API
- Base URL: `https://api.featherless.ai/v1`
- OpenAI-compatible: use `openai` npm package pointed at Featherless base URL
- For streaming: use `openai.chat.completions.create({ stream: true })` and pipe with `ReadableStream`
- Vision: pass image as base64 in content array `{ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } }`
- Model IDs follow HuggingFace format: `huihui-ai/Llama-3.3-70B-Instruct-abliterated`

### Database
- Use Mongoose with a singleton connection pattern in `lib/db.ts`
- Conversation `title` is auto-generated from the first 6 words of the user's first message
- Messages are stored as subdocuments inside Conversation
- Settings is a singleton document (findOne or create)

### Streaming
- `/api/chat` returns a `ReadableStream` using Next.js streaming response
- Frontend uses `fetch` with `response.body.getReader()` to consume tokens as they arrive
- Display tokens progressively in the assistant bubble

### Image Upload
- Accept jpeg, png, webp only, max 5MB
- Convert to base64 on the client using FileReader
- Only show upload button when selected model has `vision_supported: true`
- Send base64 string alongside the text message to `/api/chat`

### Model Selector
- On app load, fetch `/api/models` (server-side filtered by admin whitelist)
- Cache model list in React state / context
- Show badges: tag model names containing `abliterated`, `uncensored`, `lexi`, `dolphin`, `hermes`
- Store last used model in user record in DB

---

## Design System

### Colors (Tailwind custom config)
```js
colors: {
  base: '#080808',
  surface: '#111111',
  border: '#1e1e1e',
  accent: '#3B82F6',
  'accent-dim': '#1d4ed8',
  muted: '#6b7280',
  text: '#e5e7eb',
}
```

### Typography
- Display / headings: `Syne` (Google Fonts)
- Body / UI: `DM Sans`
- Code / model names: `Geist Mono`

### Animation (Framer Motion)
- Sidebar: `x: -100% → 0` on mount
- Messages: stagger fade-up `y: 20 → 0, opacity: 0 → 1`
- Model selector dropdown: `scaleY: 0 → 1, opacity: 0 → 1` from top
- Page transitions: `opacity: 0 → 1`

### Component Conventions
- All components are client components (`'use client'`) unless purely display
- Use Sonner for all toasts: `toast.success()`, `toast.error()`
- Tailwind only for styling — no inline styles
- Lucide React for all icons

---

## Packages to Install
```bash
npm install openai mongoose next-auth bcryptjs sonner framer-motion lucide-react
npm install -D @types/bcryptjs
```

---

## Do Not
- Never call Featherless directly from client components
- Never expose `FEATHERLESS_API_KEY` to the browser
- Never store plain-text passwords
- Never skip the vision check before showing image upload UI
- Don't use `pages/` router — this is App Router only
