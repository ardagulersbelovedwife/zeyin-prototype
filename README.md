Zeyin — Focus Therapy Prototype

Early-stage prototype for focus therapy and cognitive overload prevention.

Zeyin helps users structure attention using a Plan → Do → Reflect flow, short focus timers, micro-quests, and supportive UI elements (including a dynamic “procrastination monster” concept).

🚀 Core Concept

Zeyin is built around three principles:

Structured focus sessions (Plan → Do → Reflect)

Low-pressure micro-interventions

Gentle behavioral feedback instead of streak pressure

This prototype explores how UX, light gamification, and guided routines can reduce cognitive overload and procrastination.

✨ Features (Current MVP)

🔐 Email authentication (Supabase)

⏱ Custom focus timer (5 / 10 / 15 / 25 min)

🧠 Micro-quest trigger system

📋 Therapy flow page (structured focus plan)

👥 Community prototype

👾 Interactive “procrastination monster” (behavior-linked UI feedback)

🎨 Light blue / white therapeutic UI theme

🛠 Tech Stack

Next.js (App Router)

TypeScript

Supabase (Auth + Database)

Tailwind CSS

PostCSS

⚙️ Local Setup
1. Clone the repository
git clone https://github.com/your-username/zeyin-prototype.git
cd zeyin-prototype

2. Install dependencies
npm install

3. Create environment file

Create a file named:

.env.local


Add:

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key


(Do NOT commit this file.)

4. Run development server
npm run dev


Open:

http://localhost:3000

🔐 Authentication

Authentication is handled via Supabase email/password login.

Middleware protects private routes and redirects unauthenticated users to /login.

🧩 Architecture Overview
app/
  focus/
  therapy/
  community/
  login/
lib/
  supabaseClient.ts
  useAuthGuard.ts
middleware.ts
schema.sql


useAuthGuard manages session + profile state

AuthGate wraps protected content

Focus + Therapy modules operate independently

Monster UI component reacts to user inactivity

🗺 Roadmap

Planned improvements:

📊 XP system with visual progression

👾 Monster emotional states tied to focus consistency

🧠 Adaptive micro-interventions

📈 Session analytics dashboard

📱 Mobile optimization

🌍 Deployment (Vercel)

🎯 Vision

Zeyin is not a productivity tracker.

It aims to become a behavioral interface for focus training — combining therapy structure, interactive feedback, and minimal cognitive friction.

📄 License

MIT License

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
