# ⚡ DevFlow — Developer Productivity Platform

> A modern workspace built for developers to manage projects, tasks, code snippets, GitHub activity, and AI assistance in one place.

<p align="center">
  <a href="https://dev-flow-developers-productivity-pl.vercel.app/">
    🚀 Live Demo
  </a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://github.com/Mslight16/DevFlow-Developers-Productivity-Platform">
    💻 GitHub Repository
  </a>
</p>

---

## ✨ Overview

**DevFlow** is a full-stack developer productivity platform designed to bring essential development workflows into a single workspace.

It combines project management, task tracking, code snippets, GitHub integration, and an AI assistant into a clean and focused developer experience.

---

## 🚀 Features

* 📁 **Project Management** — Create and organize development projects.
* ✅ **Task Management** — Create, update, prioritize, and track tasks.
* 📋 **Kanban Workflow** — Manage tasks through different development stages.
* 💻 **Code Snippets** — Save and organize reusable code.
* 🐙 **GitHub Integration** — Connect GitHub and view repositories, commits, and activity.
* 🤖 **AI Assistant** — Get AI-powered development assistance using Groq with OpenRouter fallback.
* 🔐 **Authentication** — Secure user authentication with Supabase.
* 👤 **User Profiles** — Manage developer account information.
* ☁️ **Persistent Data** — Projects, tasks, and snippets are stored securely in Supabase.

---

## 🛠️ Tech Stack

**Frontend**

* Next.js
* React
* TypeScript
* Tailwind CSS
* MUI
* Lucide React

**Backend & Database**

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security

**Integrations**

* GitHub API
* GitHub OAuth
* Groq
* OpenRouter

**Other**

* React Hook Form
* Zod
* Zustand
* Recharts

---

## 📸 Preview

> Add screenshots or a short GIF of the DevFlow workspace here.

<!-- Example:
![DevFlow Dashboard](./public/screenshots/dashboard.png)
-->

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mslight16/DevFlow-Developers-Productivity-Platform.git
cd DevFlow-Developers-Productivity-Platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up Supabase

Run the SQL migrations from:

```text
supabase/migrations/
```

### 5. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── api/
│   │   ├── ai/
│   │   └── github/
│   └── page.tsx
│
├── components/
│   ├── workspace.tsx
│   └── workspace/
│
├── lib/
│   ├── ai/
│   └── supabase/
│
└── types/

supabase/
└── migrations/
```

---

## 🌐 Links

**Live Demo:**
https://dev-flow-developers-productivity-pl.vercel.app/

**GitHub:**
https://github.com/Mslight16/DevFlow-Developers-Productivity-Platform

---

## 👩‍💻 Author

**Roshni Verma**

Built with ❤️ using **Next.js, TypeScript, Supabase, GitHub API, and AI technologies.**

---

<p align="center">
  ⚡ <strong>DevFlow — Build. Organize. Focus. Ship.</strong>
</p>
