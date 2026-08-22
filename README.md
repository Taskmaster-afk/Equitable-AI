# AI for Equitable Education Access

An AI-powered learning platform that connects a student's specific confusion to the right explanation — at the right level, in the right language — while giving teachers early, evidence-based visibility into who needs help, and helping students discover financial aid they qualify for. Built entirely on **open/public educational content**, with every AI-generated explanation traceable back to a real source.

This is the implementation for Problem Statement 2: *AI for Equitable Education Access* (Theme: Education, Language Access and Personalized Learning).

---

## Table of Contents

- [What This App Does](#what-this-app-does)
- [Core Modules](#core-modules)
- [How Grounding Works](#how-grounding-works-the-rag-pipeline)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Security & Privacy](#security--privacy)
- [Known Limitations](#known-limitations)
- [Scripts](#scripts)

---

## What This App Does

Many students never get unstuck — not because good explanations don't exist somewhere, but because nothing connects their specific confusion to the right one, in their language, at their level. Teachers, meanwhile, often can't see which students are falling behind until a test result makes it obvious.

This platform closes that gap with one connected system, built around a shared open-content knowledge base, serving three audiences:

- **Students** get instant, cited, level-appropriate explanations and practice that adapts to their actual weak spots.
- **Teachers** get an explainable, evidence-based view of which students need help and why — plus AI-generated remediation plans.
- **Students & guardians** get help discovering scholarships and aid they're actually eligible for, with transparent reasoning.

Every module shares the same retrieval layer, so notes a teacher uploads to a class immediately become citable material the Doubt Solver and Practice Generator can draw on — not five disconnected demos, one platform.

---

## Core Modules

### 1. Grounded Doubt-Solving Agent
Students ask a question (text, or a photo of handwritten work) and get a step-by-step explanation that is **retrieved from real source material first, then generated** — never just generated from the model's memory. Every answer cites its source (curriculum chapter, classroom-shared notes, or community resource dump). Supports 8 languages and adjusts explanation style/vocabulary to grade level. Follow-up questions ("I'm still confused about step 2") get a genuinely re-worked explanation, not a repeat.

### 2. Adaptive Practice Generator
Generates practice questions targeting a student's **weakest topics**, not a random shuffle. Tracks a per-topic mastery percentage and a recent-performance streak; after repeated wrong answers it automatically steps down to a prerequisite/foundational question before returning to the original difficulty. Every generated question is grounded in the same corpus as the Doubt Solver, with the source cited.

### 3. Teacher-Facing Insight Agent
Aggregates each student's quiz accuracy, doubt frequency, and topic-level mastery into a ranked, **explainable** flag list — every flag comes with a plain-language reason ("struggling with repeated errors on X, low practice accuracy") and a suggested intervention, never just a score. Includes a class-wide topic heatmap and an AI-generated 15-minute remediation lesson plan for any weak topic. Teacher data is isolated: a teacher can only see diagnostics for their own classes.

### 4. Scholarship / Eligibility Matcher
Matches a student's self-reported profile (grade, income bracket, category, gender, academic score, first-generation status) against a database of real government/institutional aid schemes. Every match shows **which specific criteria were met or unmet** — results are phrased as "you appear eligible based on what you entered," never as a guarantee of approval.

### 5. Supporting features (beyond the original brief)
- **Classroom Hub** — teachers share notes/files with their class; instantly become part of the retrievable knowledge base for that class.
- **Open Resource Library** — a community-wide dump of shared study material, indexed the same way.
- **Community Forum** — institution-wide doubt threads with peer/teacher answers and upvoting.
- **Multimodal ingestion** — images, PDFs, and video lecture notes can be uploaded and are transcribed/summarized into searchable text.

---

## How Grounding Works (the RAG pipeline)

This app does **not** fine-tune or locally train any model. It uses Retrieval-Augmented Generation (RAG):

1. A student's question (or a practice-generation request) is expanded using a **concept ontology** — a hand-built map of ~100+ synonyms and related terms per topic (e.g. "catching a cricket ball" → "impulse", "momentum", "F=ma"), so paraphrased questions still match the right material.
2. The expanded query is scored against three pools of content: the core open-curriculum corpus, notes shared in that student's classroom, and the community resource library — using keyword/BM25-style frequency weighting plus concept-boosted scoring.
3. The top-matching passages are injected directly into the prompt sent to Gemini, along with a strict system instruction: explain only using the provided passages, cite the exact source, and say so honestly if nothing in the corpus grounds the question (never fabricate a citation).
4. If no Gemini API key is configured, a deterministic offline fallback generates a structurally similar (if less flexible) explanation from the same retrieved passage, so the app is still fully demoable without an API key.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS 4, Framer Motion, lucide-react |
| Backend | Node.js, Express |
| AI | Google Gemini (`gemini-3.7-flash`) via `@google/genai`, multimodal (text/image/video) |
| Auth | PBKDF2-SHA512 salted password hashing, HMAC-SHA256 signed bearer tokens |
| Data | In-memory store (Maps/Arrays) seeded with realistic demo data — no external database required |

---

## Project Structure

```
Equitable-AI/
├── server.js                     # Express API server: auth, retrieval/RAG, all module endpoints
├── src/
│   ├── App.jsx                   # Root component, session restore, tab routing
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── LoginPage.jsx         # Login + multi-step teacher/student registration
│   │   ├── Navbar.jsx
│   │   ├── DoubtSolver.jsx       # Module 1 UI
│   │   ├── AdaptivePractice.jsx  # Module 2 UI
│   │   ├── TeacherDashboard.jsx  # Module 3 UI
│   │   ├── ScholarshipMatcher.jsx# Module 4 UI
│   │   ├── ClassHub.jsx          # Classroom resource sharing
│   │   ├── OerLibrary.jsx        # Community resource dump/library
│   │   ├── CommunityForum.jsx    # Institution-wide doubt forum
│   │   └── ArchitectureTransparencyModal.jsx  # "How this AI works" panel for judges/users
│   ├── data/
│   │   ├── oerKnowledgeBase.js   # Core open-curriculum corpus + supported languages
│   │   ├── scholarshipDatabase.js# Aid/scholarship scheme definitions
│   │   └── curriculumStandards.js# Institution types, academic tiers, grading systems
│   └── services/
│       └── api.js                # Frontend API client + session token storage
├── index.html
├── vite.config.ts
├── package.json
└── .env.example
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- (Optional) A Google Gemini API key — the app runs in a fully functional offline fallback mode without one, but explanations/questions will be less flexible.

### Installation

```bash
git clone https://github.com/Taskmaster-afk/Equitable-AI.git
cd Equitable-AI
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
GEMINI_API_KEY="your-gemini-api-key-here"
```

If you skip this, the app still runs — `GET /api/health` will report `"aiEnabled": false` and all AI-dependent endpoints fall back to deterministic, corpus-grounded responses instead of calling Gemini.

### Run in development

```bash
npm run dev
```

This starts the Express server with Vite in middleware mode at **http://localhost:3000**.

### Build for production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | No (recommended) | Enables live Gemini calls for explanations, practice generation, and lesson plans. Without it, the app uses offline grounded fallbacks. |
| `SESSION_SECRET` | No | HMAC secret used to sign session tokens. A default is used if unset — **set this explicitly before any real deployment.** |
| `APP_URL` | No | Self-referential URL, used only in hosted (AI Studio / Cloud Run) deployments. |

---

## Demo Accounts

The app seeds realistic demo data on startup so it can be explored immediately without registering.

**Teachers** (password: `teacher123`)
| Name | Email | Institute | Level |
|---|---|---|---|
| Dr. Rajesh Varma | rajesh.varma@school.edu.in | Kendriya Vidyalaya No. 1 | Grades 11–12 |
| Mrs. Sunita Sharma | sunita.sharma@school.edu.in | Kendriya Vidyalaya No. 1 | Grades 9–10 |
| Prof. Arvind Kumar | arvind.kumar@iitd.ac.in | IIT Delhi | Undergraduate CS |
| Dr. Ananya Ray | ananya.ray@aiims.edu | AIIMS | Undergraduate Medicine |

**Students** (password: `password123`)
| Name | Email | Class Code |
|---|---|---|
| Aarav Sharma | aarav.sharma@student.edu.in | NCERT-12A |
| Priya Patel | (see class NCERT-12A) | NCERT-12A |
| Rohan Das | — | NCERT-10A |
| Ananya Mukherjee | — | NCERT-12A |
| Kabir Mehta | — | UNIV-UG1 |

You can also register a new teacher (which creates a new institute + class code) or a new student (joining an existing class code) from the login screen.

---

## API Reference

All endpoints are served from the same origin as the frontend (`http://localhost:3000` in dev).

### Auth
| Method & Path | Purpose |
|---|---|
| `POST /api/auth/login` | Login as teacher or student; returns a signed session token |
| `GET /api/auth/verify` | Validate a bearer token and rehydrate the current user |
| `POST /api/auth/register-teacher` | Register a teacher (and optionally a new institute + first class) |
| `POST /api/auth/register-student` | Register a student into an existing class code |

### Doubt Solving & Practice
| Method & Path | Purpose |
|---|---|
| `POST /api/doubt/solve` | Grounded, cited explanation for a question (text or image) |
| `POST /api/practice/generate` | Adaptive practice question targeting the student's weakest topic |
| `POST /api/practice/submit` | Submit an answer; updates the student's mastery profile |

### Teacher Tools
| Method & Path | Purpose |
|---|---|
| `GET /api/teacher/insights` | Ranked, explainable list of flagged students + class topic heatmap |
| `POST /api/teacher/lesson-plan` | AI-generated 15-minute remediation plan for a weak topic |
| `GET /api/teacher/classes` | Classes owned by the authenticated teacher |
| `POST /api/teacher/create-class` | Create an additional class under a teacher |

### Scholarships
| Method & Path | Purpose |
|---|---|
| `POST /api/scholarships/match` | Ranked, criteria-transparent scholarship matches for a profile |

### Classroom & Community Content
| Method & Path | Purpose |
|---|---|
| `GET/POST/DELETE /api/class/:code/resources` | Classroom-shared notes/files (auto-indexed for retrieval) |
| `GET/POST/DELETE /api/resources/dumps` | Community open resource library |
| `GET/POST /api/community/posts` | Institution-wide doubt forum threads and answers |

### System / Transparency
| Method & Path | Purpose |
|---|---|
| `GET /api/health` | Server + AI status, corpus size, active user counts |
| `GET /api/system/audit` | Architecture summary (model, retrieval strategy, security approach) |
| `GET /api/system/probe-retrieval` | Debug endpoint: see exactly what the retrieval layer returns for a given query, including concept-ontology query expansion |

---

## Security & Privacy

- Passwords are stored using **PBKDF2-SHA512 with a random per-user salt** (never plaintext).
- Sessions use **HMAC-SHA256 signed bearer tokens** with a 7-day expiry, verified server-side on every protected request.
- Teacher-facing insight data is **isolated per teacher** — a teacher can only query diagnostics for classes they own.
- The Scholarship Matcher collects only the minimum profile fields needed for eligibility matching; it does not collect or store identity documents.
- **Note on compliance claims:** internal documentation/audit text references privacy frameworks (e.g. FERPA/COPPA) as design principles the app was *built with in mind*. It has not undergone formal compliance certification — treat those references as a design intent, not a certification, especially given that many users are minors.

---

## Known Limitations

- **Retrieval is keyword/concept-ontology based, not embedding-based.** It handles the paraphrases covered by the ontology well, but a genuinely novel phrasing outside that map may not retrieve the ideal passage.
- **The open-curriculum corpus is a curated, hand-authored representative set** (28 entries) styled after real open-license textbooks (NCERT/OpenStax conventions), not a bulk ingestion of actual textbook text. Treat it as a demonstration corpus, not a production-scale ingestion pipeline.
- **In-memory data store** — all data (users, classes, resources, forum posts) resets when the server restarts. There is no persistent database yet.
- **No automated test suite** — verification so far has been manual/functional (build + endpoint checks).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Express + Vite middleware) |
| `npm run build` | Build the frontend (Vite) and bundle the server for production |
| `npm start` | Run the production build |
| `npm run preview` | Preview the built frontend only |
| `npm run clean` | Remove the `dist/` build output |
| `npm run lint` | Syntax-check `server.js` |
