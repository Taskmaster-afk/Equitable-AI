# AI for Equitable Education Access

An intelligent, grounded education platform designed to democratize high-quality personalized learning and teacher diagnostics. Built on verified **Open Educational Resources (OER)**, the platform connects each student's specific academic confusion to clear, level-appropriate explanations in their native language — with every AI response strictly grounded and cited from curriculum material.

---

## 📑 Table of Contents

- [Overview & Problem Statement](#overview--problem-statement)
- [Key Features & Modules](#key-features--modules)
- [How Grounding Works (RAG Architecture)](#how-grounding-works-rag-architecture)
- [Tech Stack](#tech-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [Local Development & Setup Guide](#local-development--setup-guide)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Install Dependencies](#step-2-install-dependencies)
  - [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
  - [Step 4: Start the Application](#step-4-start-the-application)
  - [Step 5: Access the Web App](#step-5-access-the-web-app)
- [Building & Running in Production](#building--running-in-production)
- [Environment Variables Guide](#environment-variables-guide)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Security, Privacy & Ethics](#security-privacy--ethics)
- [Available NPM Scripts](#available-npm-scripts)

---

## 🎯 Overview & Problem Statement

Millions of students fall behind not because high-quality educational explanations don't exist, but because standard learning tools fail to connect a student's exact point of confusion with level-appropriate explanations in their preferred language. Concurrently, teachers in high-ratio classrooms lack real-time diagnostic visibility into specific student weaknesses until high-stakes exams.

**AI for Equitable Education Access** bridges this divide through a unified, accessible ecosystem:
- **For Students:** Multilingual, Socratic doubt resolution, adaptive practice with prerequisite scaffolding, real-time study material Q&A (**Book-Pedia**), and eligibility-matched financial aid discovery.
- **For Teachers:** Diagnostic mastery heatmaps, early alert flags with pedagogical explanations, automated 15-minute remediation lesson plans, and classroom resource distribution.
- **For Institutions & Communities:** Decentralized open educational resource sharing (OER dumps) and peer/teacher verified community doubt forums.

---

## 🚀 Key Features & Modules

### 1. Grounded Socratic Doubt-Solving Agent
- **Multimodal Input:** Students can type their question, upload photos/handwritten diagrams, or use voice input.
- **8 Supported Languages:** English, Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, and Kannada.
- **Curriculum Grounding:** Every answer retrieves relevant curriculum concepts (NCERT/OpenStax) before generating, providing step-by-step reasoning with direct citations.
- **Socratic Clarification:** Follow-up questions provide tailored clarification rather than repeating previous text.

### 2. Adaptive Practice & Prerequisite Scaffolding
- **Targeted Generation:** Formulates practice questions addressing a student's diagnosed weak spots rather than random question pools.
- **Automatic Difficulty Adjustment:** Implements prerequisite step-downs (Foundational $\rightarrow$ Intermediate $\rightarrow$ Advanced) upon consecutive errors.
- **Mastery Tracking:** Persists topic-level accuracy, streak metrics, and instant step-by-step solution breakdowns.

### 3. Book-Pedia AI Agent
- **Study Material Assistant:** A dedicated side-by-side study companion that indexes classroom notes, teacher lecture slides, uploaded textbooks, and community OER dumps.
- **Strict Verification:** Restricts answers to uploaded materials and provides reference hyperlinks back to source files.

### 4. Teacher Diagnostic Dashboard & Lesson Planner
- **Classroom Mastery Heatmap:** Visual breakdown of class performance across key curriculum topics.
- **Explainable Early-Alert Flags:** Highlights students needing intervention with plain-language diagnostic reasons (e.g., *"Repeated errors on Newton's Laws with low practice accuracy"*).
- **15-Minute Remediation Generator:** Generates structured board-work lesson plans with real-world hooks and diagnostic formative check questions.

### 5. Scholarship & Financial Aid Matcher
- **Transparent Criteria:** Evaluates student profiles against central, state, and private scholarship databases with itemized eligibility checks (income thresholds, gender, academic tiers, first-generation status).

### 6. Classroom Hub & Community OER Library
- **Classroom Hub:** Class code rosters, teacher announcements, and direct syllabus resource distribution.
- **Community Dumps:** Open-access educational repository searchable by grade, subject, and institution.
- **Community Forum:** Peer-to-peer discussions with teacher verification badges and community moderation.
- **Direct Messaging & Counseling Chat:** Dedicated communication and student mental wellbeing support.

---

## 🧠 How Grounding Works (RAG Architecture)

The system does **not** rely on unconstrained model memory or hallucinated citations. It implements a multi-stage **Retrieval-Augmented Generation (RAG)** pipeline:

```
[Student Question / Image]
           │
           ▼
[Concept Ontology Query Expansion] (100+ mapped STEM synonyms & prerequisite linkages)
           │
           ▼
[Multi-Corpus Scorer] (Scores Core OER Textbooks + Classroom Notes + Community Dumps)
           │
           ▼
[Injected Verified Context Passages]
           │
           ▼
[Gemini 3.7 Flash Model] ─── (Offline Deterministic Fallback if API key absent)
           │
           ▼
[Grounded Answer + Exact Source Citations + Recommended Follow-ups]
```

1. **Query Expansion:** Queries are normalized and expanded via a domain concept ontology (e.g., *"cricket ball impact"* $\rightarrow$ *"impulse, momentum conservation, $F = \Delta p / \Delta t$ "*).
2. **Context Retrieval:** Matches the expanded query against the knowledge corpus using BM25 frequency weighting and semantic category boosts.
3. **Prompt Grounding:** Retrieved excerpts are passed with strict system instructions to cite only provided materials.
4. **Resilient Fallback:** When running offline without a Gemini API key, a deterministic fallback engine generates grounded responses directly from the retrieved corpus passages.

---

## 🛠 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, Motion (`motion/react`), Lucide React |
| **Backend API** | Node.js (ES Modules), Express 4 |
| **AI / LLM** | Google Gemini (`gemini-3.7-flash`) via `@google/genai` TypeScript/JavaScript SDK |
| **Database** | Hybrid: In-Memory Database (zero configuration needed) + Optional MongoDB / Mongoose persistence |
| **Authentication** | PBKDF2-SHA512 Salted Password Hashing, HMAC-SHA256 Bearer Session Tokens |
| **Bundling & Build** | Vite + `esbuild` for single-bundle CommonJS server compilation |

---

## 📁 Project Architecture & Directory Structure

```
Equitable-AI/
├── server.js                     # Express backend: RAG pipeline, AI routes, auth & API controllers
├── index.html                    # Single Page Application HTML entry point
├── package.json                  # Dependencies, scripts, and build configuration
├── vite.config.ts                # Vite 6 configuration with Tailwind CSS plugin
├── tsconfig.json                 # TypeScript compiler options
├── .env.example                  # Environment variable configuration template
├── README.md                     # Documentation & local run guide
└── src/
    ├── main.jsx                  # React DOM root mounting
    ├── App.jsx                   # Main layout container, navigation tabs, session manager
    ├── index.css                 # Global CSS and Tailwind CSS directives
    ├── components/
    │   ├── LoginPage.jsx         # Teacher & Student multi-step login / registration
    │   ├── Navbar.jsx            # Responsive navigation bar, active user badge, search
    │   ├── DoubtSolver.jsx       # Module 1: Multilingual Socratic Doubt-Solving Agent
    │   ├── AdaptivePractice.jsx  # Module 2: Adaptive Practice Question Generator
    │   ├── TeacherDashboard.jsx  # Module 3: Teacher Diagnostics & Remediation Planner
    │   ├── ScholarshipMatcher.jsx# Module 4: Financial Aid & Scholarship Eligibility Matcher
    │   ├── BookPedia.jsx         # Verified Study Material & Document Q&A Agent
    │   ├── ClassHub.jsx          # Classroom Notes, Announcements & Student Roster
    │   ├── OerLibrary.jsx        # Community Open Educational Resources Library
    │   ├── CommunityForum.jsx    # Peer & Teacher verified doubt forum
    │   ├── DirectMessages.jsx    # Peer-to-peer / Teacher-Student messaging
    │   ├── CounselingModal.jsx   # Mental health & academic wellbeing chat assistant
    │   └── ArchitectureTransparencyModal.jsx # System architecture & RAG inspection modal
    ├── data/
    │   ├── oerKnowledgeBase.js   # Open-curriculum corpus and multilingual index
    │   ├── scholarshipDatabase.js# Government and institutional scholarship records
    │   └── curriculumStandards.js# Academic grading frameworks & institution standards
    ├── db/
    │   └── dataService.js        # Data access layer (in-memory + MongoDB sync)
    └── services/
        └── api.js                # Frontend API client with resilient response parser
```

---

## 💻 Local Development & Setup Guide

Follow these step-by-step instructions to get the application running on your local machine.

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: Version `18.0.0` or higher (Node 20+ recommended). Check with:
  ```bash
  node -v
  ```
- **NPM**: Version `9.0.0` or higher (bundled with Node.js). Check with:
  ```bash
  npm -v
  ```
- *(Optional)* **Git**: For cloning the repository.
- *(Optional)* **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/). *(The app works with an automated offline fallback if no key is provided).*
- *(Optional)* **MongoDB**: Local instance (`mongodb://localhost:27017`) or [MongoDB Atlas](https://www.mongodb.com/atlas) URI for persistent cloud storage.

---

### Step 1: Clone the Repository

Clone the project repository to your local machine and navigate into the project directory:

```bash
git clone https://github.com/Taskmaster-afk/Equitable-AI.git
cd Equitable-AI
```

---

### Step 2: Install Dependencies

Install all required production and development dependencies:

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory by copying the provided `.env.example`:

```bash
cp .env.example .env
```

Open the `.env` file in your preferred text editor:

```env
# Google Gemini API Key (Optional but recommended for live LLM responses)
GEMINI_API_KEY="your-gemini-api-key-here"

# MongoDB Connection URI (Optional: Leave blank for in-memory database)
# Examples:
# MongoDB Atlas: mongodb+srv://<user>:<password>@cluster.mongodb.net/equitable_ai?retryWrites=true&w=majority
# Local MongoDB: mongodb://localhost:27017/equitable_ai
MONGODB_URI=""

# Secret key used for signing session tokens
SESSION_SECRET="equitable-ai-open-curriculum-secret-2026"

# Base URL for the app
APP_URL="http://localhost:3000"
```

> **Note:** If `GEMINI_API_KEY` is not provided, the platform automatically activates its **deterministic offline RAG fallback mode**, allowing full evaluation of all features without requiring an API key.

---

### Step 4: Start the Application

Run the integrated development server (Express backend + Vite frontend middleware):

```bash
npm run dev
```

You should see output similar to:
```
🔄 Initializing Equitable-AI services & connecting database...
ℹ️ MONGODB_URI not set. Running with high-performance In-Memory Database store.
🌱 In-memory database seeded with realistic institutions, classrooms, and OER corpus.
🚀 AI for Equitable Education Access server running on http://localhost:3000
```

---

### Step 5: Access the Web App

Open your browser and navigate to:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📦 Building & Running in Production

To build the application for production deployment:

### 1. Build the Frontend and Backend Bundle
```bash
npm run build
```
This runs `vite build` to generate static assets in `dist/` and uses `esbuild` to compile `server.js` into a standalone CommonJS bundle at `dist/server.cjs`.

### 2. Start the Production Server
```bash
npm start
```
The production server will bind to `http://localhost:3000` (or the port defined by your container environment).

---

## 🔑 Environment Variables Guide

| Variable | Required | Default Value | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | No | `""` | Gemini API key from Google AI Studio. When present, powers live generative explanations, practice questions, and lesson plans. When absent, the offline fallback handles requests. |
| `MONGODB_URI` | No | `""` | MongoDB connection string. When omitted, the app defaults to the built-in in-memory data store with pre-seeded demo records. |
| `SESSION_SECRET` | No | `equitable-ai...` | Cryptographic secret used for HMAC-SHA256 session token generation. |
| `APP_URL` | No | `http://localhost:3000` | Canonical host URL for the deployment. |

---

## 👤 Demo Credentials

The platform initializes with pre-configured accounts for instant evaluation:

### 👨‍🏫 Teacher Accounts
> **Password for all teacher accounts:** `teacher123`

| Name | Email | Institution | Level |
|---|---|---|---|
| **Dr. Rajesh Varma** | `rajesh.varma@school.edu.in` | Kendriya Vidyalaya No. 1 | Senior Secondary (Grades 11–12) |
| **Mrs. Sunita Sharma** | `sunita.sharma@school.edu.in` | Kendriya Vidyalaya No. 1 | Secondary (Grades 9–10) |
| **Prof. Arvind Kumar** | `arvind.kumar@iitd.ac.in` | IIT Delhi | Undergraduate Engineering |
| **Dr. Ananya Ray** | `ananya.ray@aiims.edu` | AIIMS New Delhi | Undergraduate Medicine |

---

### 👩‍🎓 Student Accounts
> **Password for all student accounts:** `password123`

| Name | Email / Identifier | Class Code | School / Institution |
|---|---|---|---|
| **Aarav Sharma** | `aarav.sharma@student.edu.in` | `NCERT-12A` | Kendriya Vidyalaya No. 1 |
| **Priya Patel** | `priya.patel@student.edu.in` | `NCERT-12A` | Kendriya Vidyalaya No. 1 |
| **Rohan Das** | `rohan.das@student.edu.in` | `NCERT-10A` | Kendriya Vidyalaya No. 1 |
| **Ananya Mukherjee** | `ananya.m@student.edu.in` | `NCERT-12A` | Kendriya Vidyalaya No. 1 |
| **Kabir Mehta** | `kabir.mehta@student.edu.in` | `UNIV-UG1` | IIT Delhi |

*(You can also use the registration form on the login screen to register new teachers, create new institutes/classes, or create new students).*

---

## 🔌 API Reference

All API routes are served on `/api/*`.

### Authentication
- `POST /api/auth/login` — Login as student or teacher (returns bearer token and user object).
- `GET /api/auth/verify` — Validate session token and retrieve current user context.
- `POST /api/auth/register-teacher` — Create new teacher account and optional institution/class.
- `POST /api/auth/register-student` — Register student with a class enrollment code.

### AI Learning & Doubt Resolution
- `POST /api/doubt/solve` — Solve student doubt with citations and language translation (`question`, `subject`, `grade`, `language`, `image`).
- `POST /api/practice/generate` — Generate adaptive practice questions targeting weak topics (`studentId`, `topic`, `difficulty`).
- `POST /api/practice/submit` — Record answer submission and update mastery profile (`studentId`, `topic`, `isCorrect`).
- `POST /api/bookpedia/ask` — Query uploaded classroom and library notes via Book-Pedia (`question`, `studentId`).

### Teacher Tools & Diagnostics
- `GET /api/teacher/insights` — Retrieve class mastery heatmap and flagged student list (`classCode`, `teacherId`).
- `POST /api/teacher/lesson-plan` — Generate 15-minute remediation lesson plan for a struggling topic (`topic`, `difficulty`, `targetClass`).
- `GET /api/teacher/classes` — List all classes managed by the authenticated teacher.
- `POST /api/teacher/create-class` — Create a new class code.

### Scholarships & Community Resources
- `POST /api/scholarships/match` — Match financial aid programs against a student profile (`grade`, `familyIncome`, `category`, `gender`, `academicScore`).
- `GET /api/oer/corpus` — Retrieve open-curriculum textbook documents (`subject`, `grade`).
- `GET /api/resources/dumps` — List community-uploaded resource dumps (`subject`, `grade`, `institute`, `search`).
- `POST /api/resources/dumps` — Upload new study materials to the community library.
- `GET /api/community/posts` — Retrieve community forum doubt threads and peer answers.

### System & Diagnostics
- `GET /api/health` — System status, database health, and active corpus counts.
- `GET /api/system/audit` — Architecture transparency and security configuration overview.
- `GET /api/system/probe-retrieval` — Debug endpoint to inspect concept ontology query expansion for any keyword.

---

## ❓ Troubleshooting & FAQ

### Port 3000 Already in Use
If port 3000 is occupied by another process:
```bash
# On macOS / Linux:
lsof -i :3000
kill -9 <PID>

# On Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### AI Responses Fallback / Missing API Key
If you see offline fallback responses:
1. Verify that your `.env` file contains `GEMINI_API_KEY="AIzaSy..."` without extra spaces or quotes.
2. Ensure you restart the development server after modifying `.env`.
3. Check `http://localhost:3000/api/health` in your browser — it should report `"aiEnabled": true`.

### MongoDB Connection Issues
If you provided a `MONGODB_URI` and connection fails:
- The server will log a descriptive warning and **automatically fall back to the in-memory data store**, ensuring uninterrupted application uptime.
- Ensure your MongoDB Atlas Network Access IP Whitelist includes your current IP address (or `0.0.0.0/0` for development).

---

## 🔒 Security, Privacy & Ethics

- **Zero Plaintext Credentials:** Passwords use salted PBKDF2-SHA512 hashing with cryptographically secure salts.
- **Signed Session Tokens:** Authentication tokens are signed with HMAC-SHA256 and verified server-side.
- **Data Isolation:** Teachers can only view diagnostics and student profiles for classes they explicitly own.
- **Transparent Reasoning:** Scholarship and diagnostic suggestions provide clear, human-auditable rationales.

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `node server.js` | Starts the unified Express + Vite development server on port 3000 |
| `npm run build` | `vite build && esbuild...` | Builds optimized frontend bundle and compiles backend server |
| `npm start` | `node dist/server.cjs` | Runs the compiled production build |
| `npm run lint` | `node --check server.js` | Performs syntax validation on the server script |
| `npm run clean` | `rm -rf dist` | Cleans production build artifacts |
| `npm run preview`| `vite preview` | Previews the frontend client build |

---

<div align="center">
  <sub>Built for Equitable Education Access • Open-Curriculum Grounded Learning</sub>
</div>
