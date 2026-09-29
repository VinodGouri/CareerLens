# CareerLens 🔍🤖
> **AI-powered Job Discovery, Compatibility Matching & Skill-Gap Intelligence Platform**

Designed for students, freshers, and early-career professionals in India (Hyderabad, Bangalore, Pune, Delhi NCR, Remote) to discover verified jobs, understand exact match compatibility, bridge prioritized skill gaps, optimize ATS-friendly resumes, and track recruitment pipelines in one unified platform.

---

## 🏗️ System Architecture

```text
CareerLens/
├── apps/
│   ├── web/               # React 18 + Vite + Tailwind CSS + Lucide Icons
│   │   ├── src/
│   │   │   ├── components/  # Layout, Navbar, JobCard, MatchScoreBadge, Modals, Chatbot
│   │   │   ├── pages/       # Dashboard, Explore, JobDetail, Profile, ResumeBuilder, Analyzer, Tracker, Learning, Admin
│   │   │   ├── context/     # CareerContext (profile state, job filtering, persona switcher)
│   │   │   └── App.jsx
│   │   └── package.json
│   │
│   └── api/               # Node.js + Express.js REST API
│       ├── src/
│       │   ├── data/        # Rich seed data (Indian tech jobs, LinkedIn/Naukri/Indeed, verified courses)
│       │   ├── services/    # AI Matching Engine (PRD multidimensional scoring & taxonomy)
│       │   └── server.js    # Express REST API
│       └── package.json
│
├── services/
│   └── ai/                # Python FastAPI Microservice (NLP, resume parser, bullet enhancer)
│       ├── app/
│       ├── main.py
│       └── requirements.txt
│
├── docker-compose.yml     # PostgreSQL (pgvector) + Redis
├── .env.example
├── package.json           # Root workspaces & concurrently runner
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
Run the following in the project root:
```bash
npm install
npm install --prefix apps/api
npm install --prefix apps/web
```

### 2. Run the Development Servers
You can run the full stack concurrently:
```bash
npm run dev
```

Or run each independently:
- **API Server** (Port 5000):
  ```bash
  npm run dev:api
  ```
- **Web Application** (Port 5173):
  ```bash
  npm run dev:web
  ```
- **Python AI Service** (Port 8000, optional microservice):
  ```bash
  cd services/ai
  pip install -r requirements.txt
  python main.py
  ```

---

## 🎯 Key Modules & PRD Features

1. **AI Compatibility Matching Engine**:
   - Computes weighted score based on PRD Section 33 formula:
     - Required Skills (40%)
     - Preferred Skills (15%)
     - Experience (15%)
     - Role Alignment (10%)
     - Project Relevance (10%)
     - Location & Work Mode (5%)
     - Education (5%)
   - **Explainability Drawer ("Why 87%?")**: Full breakdown of exact matches (✓), semantic matches (✓), partial matches (⚠), and missing skills (✕).
2. **Career Profile with Skill Evidence Linkage**:
   - Connects skills directly to demonstrated projects or internships.
   - Profile completeness gauge with actionable checklists.
3. **ATS Resume Builder & Analyzer**:
   - 4 ATS-friendly templates (Minimal, Modern, Professional, Fresher).
   - Real-time dual-pane formatted paper preview.
   - AI action-verb enhancer and summary generator.
   - One-click print/PDF export.
   - Document upload dropzone & ATS scoring.
4. **Job Ingestion & Exploration**:
   - Multi-facet filters: Remote, Location (Hyderabad, Bangalore, Pune), Experience (Fresher vs 1-3 YOE), and Portal Sources (LinkedIn, Indeed, Naukri, Wellfound).
5. **Skill-Gap Intelligence & Learning Roadmaps**:
   - Prioritized gaps (High, Medium, Low).
   - Step-by-step milestones with genuine documentation (Docker Docs, AWS Hands-on, Redis University, Vitest).
6. **Recruitment Application Tracker**:
   - Interactive Kanban board (`Saved` -> `Applied` -> `Assessment` -> `Interview` -> `Offer` -> `Rejected`).
   - Private screening notes and interview date tracker.
7. **AI Career Assistant**:
   - Floating copilot grounded in candidate's skills, projects, and target role criteria.
8. **Admin Health & Ingestion Monitor**:
   - Real-time metrics for adapter syncs, SHA-256 deduplication, and pipeline health.

---

## 👥 Built-in Personas

Switch between personas via the top-right dropdown in the Navbar:
- **Rahul Sharma (Persona 1 - Fresher)**: Final year B.Tech, React/Node.js/PostgreSQL, LMS platform and internship, targeting Software Engineer / Full Stack roles.
- **Priya Nair (Persona 2 - Junior Dev)**: 1.5 YOE Frontend Developer, transitioning into Full Stack with microservices.
