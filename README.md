# 🎓 StudyAI Platform

AI-powered study platform for students. Summarize notes, solve doubts, generate quizzes, and plan your study schedule — all in one place.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js + React Router |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas) |
| AI | OpenAI GPT-4o |
| Auth | JWT |
| File Upload | Multer + pdf-parse |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Project Structure

```
studyai/
├── backend/
│   ├── models/         # MongoDB schemas (User, Note, Quiz, Chat)
│   ├── routes/         # API routes (auth, ai, notes, quiz, planner)
│   ├── middleware/     # JWT auth + Pro check
│   ├── server.js       # Express app entry point
│   └── .env.example    # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── pages/      # Dashboard, Summarizer, ChatBot, Quiz, Planner, Progress
│   │   ├── components/ # Layout (sidebar + nav)
│   │   ├── context/    # AuthContext (user state)
│   │   └── utils/      # API calls (axios)
│   └── vercel.json     # Vercel deployment config
└── package.json        # Root scripts to run both services
```

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/yourusername/studyai.git
cd studyai
npm install          # installs concurrently
npm run install:all  # installs backend + frontend deps
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/studyai
JWT_SECRET=your_random_secret_here_make_it_long
OPENAI_API_KEY=sk-your-openai-key
CLIENT_URL=http://localhost:3000
```

### 3. Configure frontend environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run both servers

```bash
# From root directory
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API health: http://localhost:5000/api/health

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### AI (requires auth + credits)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/summarize` | Summarize text notes |
| POST | `/api/ai/summarize-pdf` | Upload + summarize PDF |
| POST | `/api/ai/chat` | Doubt solver chat |
| POST | `/api/ai/generate-quiz` | Generate MCQ quiz |
| POST | `/api/ai/study-plan` | Generate study plan |

### Notes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/:id` | Get single note |
| PATCH | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

### Quiz
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/quiz` | Save quiz |
| POST | `/api/quiz/:id/submit` | Submit score |
| GET | `/api/quiz` | Get quiz history |

---

## Freemium Model

| Feature | Free | Pro (₹99/mo) |
|---------|------|--------------|
| AI calls/day | 3 | Unlimited |
| PDF upload | ❌ | ✅ |
| Notes saved | Unlimited | Unlimited |
| Quiz history | Unlimited | Unlimited |
| Chat history | Last 10 msgs | Full history |
| Priority support | ❌ | ✅ |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Push to GitHub → connect to Vercel
# Set env: REACT_APP_API_URL=https://your-backend.railway.app/api
```

### Backend → Railway

1. Push backend folder to GitHub
2. Create new Railway project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Railway auto-detects Node.js and runs `npm start`

### Database → MongoDB Atlas

1. Create free cluster at mongodb.com/atlas
2. Add database user
3. Whitelist all IPs (0.0.0.0/0) for Railway
4. Copy connection string to `MONGODB_URI`

---

## Phase Roadmap

### ✅ Phase 1 (MVP - Done)
- [x] JWT Auth (signup/login)
- [x] AI Note Summarizer
- [x] PDF Upload + Parse
- [x] Doubt Solver Chatbot
- [x] Quiz Generator + Scoring
- [x] Study Planner
- [x] Freemium credit system

### 🔜 Phase 2
- [ ] Razorpay payment integration for Pro
- [ ] Email verification
- [ ] Flashcard generator
- [ ] Subject-wise note organization
- [ ] Mobile responsive improvements

### 🚀 Phase 3
- [ ] Performance analytics dashboard
- [ ] AI-personalized weak-area detection
- [ ] Group study rooms
- [ ] Push notifications for study reminders
- [ ] Mobile app (React Native)

---

## Revenue Targets

| Milestone | Users | MRR |
|-----------|-------|-----|
| Launch | 100 | ₹0 |
| Month 3 | 1,000 | ₹9,900 |
| Month 6 | 5,000 | ₹49,500 |
| Year 1 | 20,000 | ₹1,98,000 |

---

Built with ❤️ for Indian students.
