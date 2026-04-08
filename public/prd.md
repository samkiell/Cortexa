# PRD — Cortexa Chat Platform

## Overview
A personal-use AI chat web application powered by the Featherless AI API. Users can chat with thousands of open-source and uncensored models through a sleek, dark-themed interface. The platform supports text and image (vision) input, conversation history, model selection, user authentication, and an admin dashboard.

---

## Goals
- Access any Featherless-hosted model through a single polished UI
- Persist chat history per user in MongoDB
- Support multimodal input (text + image uploads for vision-capable models)
- Allow sharing access with other users via auth
- Provide an admin panel for platform-level configuration

---

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| UI Components | Lucide React (icons) |
| Animations | Framer Motion |
| Toasts | Sonner |
| Database | MongoDB (via Mongoose) |
| Auth | NextAuth.js (credentials provider) |
| AI API | Featherless AI (OpenAI-compatible) |
| Deployment | Vercel |

---

## Pages & Routes

### Public
| Route | Description |
|---|---|
| `/` | Landing page — hero, features, CTA |
| `/login` | Login form |
| `/register` | Registration form |

### Authenticated
| Route | Description |
|---|---|
| `/chat` | Main chat interface (new chat) |
| `/chat/[id]` | Existing conversation by ID |

### Admin (protected, role = admin)
| Route | Description |
|---|---|
| `/admin` | Dashboard overview |
| `/admin/settings` | API key config, model visibility toggle |
| `/admin/users` | User list and role management |

---

## Core Features

### 1. Authentication
- Email + password registration and login via NextAuth credentials provider
- JWT session with role field (`user` | `admin`)
- Protected routes using middleware
- Password hashed with bcrypt

### 2. Chat Interface
- Sidebar showing conversation history (title, date, model used)
- New chat button
- Message thread with user and assistant bubbles
- Markdown rendering in assistant responses
- Streaming responses (SSE / ReadableStream)
- Model selector dropdown in the chat header
  - Shows model name, size, whether vision is supported
  - Persists last selected model to user profile
- Image upload button (visible only when selected model supports vision)
  - Upload converts to base64, sent in message content array
- Typing indicator / loading skeleton while waiting for first token
- Copy button on each assistant message
- Regenerate last response button

### 3. Model Selector
- Fetches model list from Featherless `/v1/models` endpoint
- Admin can toggle which models are visible to users
- Badges: `vision`, `uncensored`, `abliterated`, `reasoning`
- Search/filter by name

### 4. Conversation History
- Each conversation stored in MongoDB with:
  - userId, title (auto-generated from first message), modelId, messages[], createdAt, updatedAt
- Sidebar groups by Today, Yesterday, Last 7 Days, Older
- Click to restore full conversation
- Delete conversation

### 5. Admin Panel
- Set/update Featherless API key (stored encrypted in DB)
- Toggle model visibility (whitelist which models users can select)
- View all users, change roles, deactivate accounts
- Basic usage stats (total messages, active users)

---

## Data Models

### User
```
{
  _id, email, passwordHash, name, role, selectedModel, createdAt
}
```

### Conversation
```
{
  _id, userId, title, modelId, messages: [{ role, content, imageUrl?, timestamp }], createdAt, updatedAt
}
```

### Settings (admin, singleton)
```
{
  featherlessApiKey, visibleModels: [string], updatedAt
}
```

---

## API Routes (Next.js)

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/auth/register` | Create new user |
| GET | `/api/models` | Return visible model list |
| POST | `/api/chat` | Stream chat completion |
| GET | `/api/conversations` | Get user's conversations |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/[id]` | Get single conversation |
| PUT | `/api/conversations/[id]` | Update conversation (append message) |
| DELETE | `/api/conversations/[id]` | Delete conversation |
| GET | `/api/admin/users` | List all users (admin) |
| PATCH | `/api/admin/users/[id]` | Update user role (admin) |
| GET/PUT | `/api/admin/settings` | Get/update platform settings (admin) |

---

## Design Direction
- Dark theme, near-black background (`#080808` base)
- Accent: cold electric blue `#3B82F6` or neon cyan `#06B6D4`
- Font: `Geist Mono` for code/model names, `Syne` or `Cabinet Grotesk` for UI
- Sidebar: slightly lighter dark panel with subtle border
- Chat bubbles: user messages right-aligned with accent background, assistant left-aligned with card background
- Framer Motion: sidebar slide-in, message fade-up stagger, model selector dropdown scale
- Sonner toasts: bottom-right, dark variant

---

## Non-Functional Requirements
- API key never exposed to client (all Featherless calls go through `/api/chat`)
- Vision image uploads validated for size (max 5MB) and type (jpeg, png, webp)
- Admin route middleware checks role from JWT
- Mobile responsive (sidebar collapses to drawer on small screens)
