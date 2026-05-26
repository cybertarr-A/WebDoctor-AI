# WebDoctor AI - Intelligent Website Diagnostics Engine

WebDoctor AI is an enterprise-grade SaaS platform that acts as an "intelligent doctor" for websites. Enter any URL to compile real-time diagnostic reports, evaluate transport security, map technical frameworks, calculate standardized metrics, and generate deep, actionable AI-powered recommendations.

---

## 🛠️ Technology Stack
* **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
* **Backend**: FastAPI (Python 3.11), Async IO, Pydantic v2, HTTPX, BeautifulSoup4, SlowAPI, SQLite
* **Database**: Supabase Cloud
* **AI Engine**: Groq Llama-3 AI / Heuristics Compiler
* **DevOps**: Docker, multi-stage builders

---

## 🏗️ Folder Structure
```text
webdoctor-ai/
├── frontend/
│   ├── app/                # Next.js 15 pages (Home, Dashboard)
│   ├── components/ui/      # Animated radial dials, custom widgets
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Scan controllers and download links
│   │   ├── core/           # Pydantic base configuration settings
│   │   ├── services/       # Async pipeline orchestrator
│   │   │   └── scanners/   # Micro-scanners (SEO, Perf, Sec, Tech, Domain)
│   │   ├── schemas/        # Request & Response contracts
│   │   └── utils/          # Resilient Supabase / SQLite database broker
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
│
└── README.md               # Operations manual
```

---

## 🚀 Local Installation & Execution

### 1. Backend Server Setup
Navigate to the `backend/` directory, copy settings, and spin up dependencies:
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install libraries
pip install -r requirements.txt

# Start Uvicorn developer worker using virtual environment path
./venv/bin/uvicorn main:app --reload --port 8000
```
> [!NOTE]
> WebDoctor AI initializes a local SQLite file `webdoctor.db` in the workspace automatically if Supabase environment variables are not populated.

### 2. Frontend Application Setup
Navigate to the `frontend/` directory, resolve node packages, and launch Next.js:
```bash
# Navigate to frontend folder
cd ../frontend

# Install node dependencies
npm install

# Start Next.js developer hot-reloader
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📡 REST API Documentation

### 1. Synchronous Diagnostics Scan
* **URL**: `/api/v1/analyze`
* **Method**: `POST`
* **Request Payload**:
  ```json
  {
    "url": "https://example.com"
  }
  ```
* **Response Details**:
  ```json
  {
    "id": "e4a78b5e90df341a",
    "url": "https://example.com",
    "overall_score": 85,
    "seo_score": 84,
    "performance_score": 80,
    "security_score": 90,
    "accessibility_score": 88,
    "technology_score": 90,
    "technology": ["Next.js", "React", "Cloudflare"],
    "issues": [
      "Missing Strict-Transport-Security (HSTS) header"
    ],
    "recommendations": [
      "Configure HSTS at your web server level to block downgrade vectors."
    ]
  }
  ```

### 2. Retrieve Historical Audit
* **URL**: `/api/v1/scan/{scan_id}`
* **Method**: `GET`

### 3. Exclude List Logs
* **URL**: `/api/v1/scans/recent`
* **Method**: `GET`

### 4. Text Report Stream Download
* **URL**: `/api/v1/scan/{scan_id}/download`
* **Method**: `GET`

---

## ☁️ Cloud Deployments

### 🐳 Docker Execution (Local Containerization)
Ensure Docker is installed, then build and boot the container:
```bash
# Build multi-stage image
docker build -t webdoctor-backend ./backend

# Spin up backend mapping port 8000
docker run -p 8000:8000 webdoctor-backend
```

### 🚆 Railway (FastAPI Deployment)
1. Fork your project to GitHub.
2. Sign in to **[Railway.app](https://railway.app/)** and link your repository.
3. Railway automatically detects the root `backend/Dockerfile` and spins up the FastAPI container.
4. Input env keys in Railway settings (`GROQ_API_KEY`, `SUPABASE_URL`, etc.).

### ⚡ Vercel (Next.js Deployment)
1. Link your repo to **[Vercel](https://vercel.com/)**.
2. Configure **Framework Preset** to `Next.js`.
3. Add a proxy mapping or input your Railway domain as the backend environment pointer.
