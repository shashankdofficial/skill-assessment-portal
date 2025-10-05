# 🧠 Skill Assessment Reporting Portal

A full-stack web application that allows users to take skill-based quizzes, view reports, and enables admins to manage skills, questions, and users with detailed analytics.

---

## 🚀 Features

### 👥 User Side
- User registration and login (JWT authentication)
- Take quizzes by skill
- Real-time score calculation and report generation
- View past quiz reports

### 🧑‍💼 Admin Side
- Manage users (activate/deactivate, role assignment)
- Create, edit, and delete skills
- Add and manage questions per skill
- Pagination, search, and filtering support
- Reports dashboard with graphical data visualization

### 🧩 Shared Features
- Secure REST APIs (JWT protected)
- Sequelize ORM with MySQL
- Unit tests using Jest & Supertest
- Optional Docker containerization

---

## 🏗️ Project Architecture

```
Skill_Assessment_Reporting_Portal/
│
├── backend/                     # Node.js + Express + Sequelize
│   ├── src/
│   │   ├── models/              # Sequelize models
│   │   ├── routes/              # REST API routes
│   │   ├── middlewares/         # Authentication & role-based access
│   │   └── app.js               # App entry point
│   ├── tests/                   # Jest + Supertest unit tests
│   ├── Dockerfile               # (Optional) Backend container
│   ├── package.json
│   └── jest.config.js
│
├── frontend/                    # React + Axios + React Router
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/           # Admin pages
│   │   │   │   ├── AdminUserManager.jsx
│   │   │   │   ├── QuestionManager.jsx
│   │   │   │   ├── SkillManager.jsx
│   │   │   │   └── AdminReports.jsx
│   │   │   ├── Quiz.jsx         # User quiz page
│   │   │   ├── Dashboard.jsx    # User dashboard
│   │   │   ├── Login.jsx        # Login page
│   │   │   └── Register.jsx     # Registration page
│   │   ├── components/          # Reusable UI components
│   │   ├── api/axios.js         # Axios setup for API calls
│   │   └── utils/fetchSecureData.js  # Authenticated fetch helpers
│   ├── Dockerfile               # (Optional) Frontend container
│   ├── package.json
│
├── docker-compose.yml           # (Optional) Combined services
└── README.md                    # You are here
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Chart.js, Axios, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL with Sequelize ORM |
| **Auth** | JWT (JSON Web Tokens) |
| **Testing** | Jest, Supertest |
| **Containerization (optional)** | Docker, Docker Compose |

---

## 🔧 Setup Instructions (Local Development)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/skill-assessment-portal.git
cd skill-assessment-portal
```

### 2️⃣ Setup the Backend
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=skill_portal
JWT_SECRET=supersecret
```

Run backend:
```bash
npm start
```

Backend runs at: http://localhost:4000

---

### 3️⃣ Setup the Frontend
```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: http://localhost:3000

---

## 🧪 Running Unit Tests

```bash
cd backend
npm test
```

For coverage report:
```bash
npm run coverage
```

✅ Expected Output:
```
Test Suites: 4 passed, 4 total
Tests:       5 passed, 5 total
Coverage:    ~40%+
```

---

## 🐳 Docker (Optional)

```bash
docker-compose up --build
```

Services:
- Backend → http://localhost:4000
- Frontend → http://localhost:3000

---

## 📊 API Overview

### Auth Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

### Skills Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/skills` | List all skills |
| POST | `/api/skills` | Create new skill (Admin) |
| PUT | `/api/skills/:id` | Update skill |
| DELETE | `/api/skills/:id` | Delete skill |

### Questions Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/questions` | List questions with pagination |
| POST | `/api/questions` | Create question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |

### Quiz Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/quiz/skill/:skillId` | Fetch questions for quiz |
| POST | `/api/quiz/attempt` | Submit quiz |

### Reports Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/reports` | View all reports |
| GET | `/api/reports/:userId` | View report by user |

---

## 📂 Folder Highlights

- **frontend/src/pages/admin** → Admin dashboard, skills, users, reports
- **backend/src/routes** → All Express REST APIs
- **backend/tests** → Jest + Supertest-based unit tests
- **frontend/src/utils/fetchSecureData.js** → Handles secure API calls

---

## 🧪 Unit Test Coverage Summary

| File | Coverage |
|------|-----------|
| Backend Overall | 37–40% (Jest) |
| Skills API | ✅ 100% passed |
| Questions API | ✅ 100% passed |
| Quiz API | ✅ 100% passed |
| Auth API | ✅ 100% passed |

---

## 🧑‍💻 Contributors
- **Shashank Dubey** — Full Stack Developer

---

## 📜 License
MIT License © 2025 — Skill Assessment Reporting Portal

---

## 💡 Future Enhancements
- Email verification & password reset
- Export reports as PDF
- Add CI/CD pipeline
- User analytics dashboard

---

## 🧰 Recommended VS Code Extensions

| Extension | Description |
|------------|--------------|
| **Markdown All in One** | Auto-formatting, preview, ToC |
| **Documatic** | AI-based auto-doc generator |
| **Auto README Generator** | Scans and creates README templates |
| **GitHub Copilot Chat** | AI-assisted README & doc writing |
| **Markdown Preview Enhanced** | Real-time markdown preview |

