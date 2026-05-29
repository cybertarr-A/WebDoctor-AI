# 🩺 WebDoctor AI

> AI-Powered Website Health Scanner, Security Auditor, SEO Analyzer, and Performance Diagnostics Platform.

<img width="1920" height="996" alt="image" src="https://github.com/user-attachments/assets/3dfc9f96-0689-4538-9c15-cfc339d13a01" />


## 🚀 Overview

WebDoctor AI is an intelligent website diagnostics platform that analyzes websites across multiple dimensions including:

* ⚡ Performance
* 🔒 Security
* 🔍 SEO
* 🌐 Domain Intelligence
* 🛠 Technology Stack Detection
* 🤖 AI-Powered Recommendations

Simply enter a website URL and WebDoctor AI performs a comprehensive audit, generating actionable insights to improve website quality, speed, security, and search engine visibility.

---

## ✨ Features

### 🔒 Security Analysis

* HTTPS verification
* Security header inspection
* SSL/TLS validation
* Vulnerability indicators
* Security score generation

### ⚡ Performance Diagnostics

* Core performance evaluation
* Loading speed analysis
* Optimization opportunities
* Website efficiency scoring

### 🔍 SEO Audit

* Meta title analysis
* Meta description validation
* Heading structure inspection
* Search engine optimization recommendations
* SEO score generation

### 🌐 Domain Intelligence

* WHOIS information lookup
* Domain age detection
* Registration insights
* Ownership metadata

### 🛠 Technology Detection

Identify technologies used by a website:

* Next.js
* React
* Vue
* Angular
* WordPress
* Tailwind CSS
* Bootstrap
* CDN Providers
* Analytics Tools
* And more...

### 🤖 AI Recommendations

Powered by modern LLMs to provide:

* Improvement suggestions
* Technical recommendations
* Security enhancements
* SEO optimization guidance
* Performance fixes

---

## 🏗 Architecture

```text
                ┌─────────────────────┐
                │     Frontend UI     │
                │ Next.js + React 19  │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    FastAPI Backend  │
                └──────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 ┌────────────┐    ┌────────────┐    ┌────────────┐
 │ SEO Scan   │    │ Security   │    │ Performance│
 │ Engine     │    │ Scanner    │    │ Scanner    │
 └────────────┘    └────────────┘    └────────────┘
        ▼                  ▼                  ▼
 ┌────────────────────────────────────────────┐
 │          AI Analysis Engine                │
 └────────────────────────────────────────────┘
                           ▼
                ┌─────────────────────┐
                │  Final Report JSON  │
                └─────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* Framer Motion
* Three.js
* React Three Fiber
* Zustand

### Backend

* FastAPI
* Python 3.11+
* Pydantic v2
* HTTPX
* BeautifulSoup4
* Python WHOIS
* SlowAPI

### AI

* Groq API
* Llama Models
* OpenAI Compatible APIs

### Database

* SQLite
* Supabase

### DevOps

* Docker
* Railway
* Vercel

---

## 📂 Project Structure

```text
WebDoctor-AI
│
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── 3d/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   └── styles/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   │   └── scanners/
│   │   ├── schemas/
│   │   ├── core/
│   │   └── utils/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/cybertarr-A/WebDoctor-AI.git

cd WebDoctor-AI
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
# Windows
# venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Backend runs at:

```text
http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
GROQ_API_KEY=your_groq_api_key

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

OPENAI_API_KEY=optional
```

---

## 📡 API Usage

### Analyze Website

**Endpoint**

```http
POST /api/v1/analyze
```

### Request

```json
{
  "url": "https://example.com"
}
```

### Response

```json
{
  "overall_score": 91,
  "seo_score": 88,
  "security_score": 95,
  "performance_score": 86,
  "technology_score": 92,
  "recommendations": [
    "Enable image compression",
    "Add missing security headers",
    "Optimize meta descriptions"
  ]
}
```

---

## 🎯 Use Cases

* Website Auditing
* SEO Analysis
* Security Reviews
* Client Reporting
* Digital Agencies
* Freelance Developers
* Startup Website Monitoring
* Technical Due Diligence

---

## 🖥 Live Demo

```text
https://web-doctor-ai.vercel.app
```

---

## 🚀 Future Roadmap

* Real Lighthouse Integration
* Accessibility Audits
* PDF Report Exports
* Continuous Monitoring
* Competitor Comparison
* AI Website Optimization Agent
* Historical Tracking Dashboard
* Multi-Page Crawling

---

## 🤝 Contributing

Contributions are welcome.

```bash
fork → clone → develop → commit → pull request
```

For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Aditya (Cybertarr-A)**

AI Engineer • Full Stack Developer • Researcher

GitHub:
https://github.com/cybertarr-A

---

### ⭐ If you find WebDoctor AI useful, please star the repository and share it with others.
