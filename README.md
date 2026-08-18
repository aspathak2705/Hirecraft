# ⚡ HireCraft — Career Positioning Web App

> **Don't Just Apply. Position Yourself.**

HireCraft transforms ordinary professional profiles into compelling personal brands. Stop competing on qualifications alone—start winning recruiter preference through strategic positioning, recruiter-focused optimization, and quantitative storytelling.

---

## 🎨 Design Identity & Style

HireCraft matches the modern design aesthetics:
- 🌌 **Navy Blue (`#0A1224`, `#111B30`)** — Trust, expertise, and authority.
- 🟡 **Mustard Gold (`#F59E0B`)** — Ambition, growth, and premium positioning.
- 📄 **Clean Layouts & Whitespace** — Built to convey premium design value with subtle card interactions and hover states.

---

## 📁 Repository Architecture

```
Hirecraft/
├── 📁 client/                # React (Vite) Frontend Application
│   ├── 📁 src/
│   │   ├── App.jsx          # Interactive UI, Audit Tool & Booking Layout
│   │   ├── index.css        # Premium styling system & design tokens
│   │   ├── main.jsx         # React application bootstrap entrypoint
│   │   └── supabase.js      # Supabase JavaScript client initialization
│   ├── package.json         # Frontend packages and dev scripts
│   └── vite.config.js       # Vite build setup
│
├── 📁 backend/               # Supabase Database Scripts
│   └── schema.sql           # Database tables, indexing & RLS policies
│
└── .gitignore               # System & environment exclude list
```

---

## 🛠️ Step-by-Step Installation

### 1. Database Setup (Supabase) 🗄️

1. Create a new project in your **Supabase Dashboard**.
2. Navigate to the **SQL Editor**.
3. Copy the contents of [`schema.sql`](file:///c:/Users/athar/OneDrive/Documents/projects/Hirecraft/backend/schema.sql) and execute the query to set up tables and Row-Level Security (RLS) configurations.

### 2. Frontend Configuration 💻

1. Move to the client folder:
   ```bash
   cd client
   ```
2. Setup environment settings by creating a `.env` file in the root of the client directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
   ```
3. Install project dependencies:
   ```bash
   npm install
   ```
4. Fire up the local development web server:
   ```bash
   npm run dev
   ```

---

## ⚡ Core Features

- 🎯 **Interactive Career Audit Tool**: Multi-stage questionnaire scoring brand visibility.
- 📩 **Strategy Consultation Funnel**: Lead capture integrated with database tracking.
- 👥 **Admin Lead Dashboard**: Live telemetry panel allowing instant review of booked calls.
