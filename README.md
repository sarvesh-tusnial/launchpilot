# Mentogram — AI-Native PM MBA

## Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=        # from Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # from Supabase project API settings
SUPABASE_SERVICE_ROLE_KEY=       # from Supabase project API settings
ANTHROPIC_API_KEY=               # from console.anthropic.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database setup
- Create a Supabase project at https://supabase.com
- Open the SQL Editor in your Supabase dashboard
- Run the contents of `schema.sql`

### 4. Run
```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure
```
mentogram/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── dashboard/      # Main dashboard
│   │   ├── learn/          # Concept lessons
│   │   │   └── [slug]/     # Individual lesson page
│   │   ├── quiz/           # Quiz system
│   │   ├── tasks/          # PM execution tasks
│   │   └── profile/        # Student profile
│   ├── api/                # API routes
│   │   ├── lessons/        # Generate AI lessons
│   │   ├── quiz/           # Quiz generation + evaluation
│   │   ├── submissions/    # Task submission + evaluation
│   │   └── progression/    # Skill graph data
│   └── auth/               # Login / signup
├── lib/
│   ├── ai/claude.ts        # All Claude API calls
│   └── db/                 # Supabase clients
├── types/index.ts          # TypeScript types
├── components/             # Shared components
├── schema.sql              # Full database schema + seed data
└── middleware.ts           # Auth protection
```

## Features
- AI-generated lessons (4 formats: explanation, analogy, anti-pattern, product moment)
- Quiz system with MCQ and scenario questions, AI-evaluated
- PM execution tasks: PRDs, prioritization, experiment design
- Rubric-based AI evaluation (6 dimensions, strict senior PM tone)
- Skill graph with prerequisite-based unlocking
- Mastery tracking (Levels 1-5 per concept)
