# 🎓 Attendance.Ai

An AI-powered smart attendance management system that automates student attendance tracking using facial recognition, modern web technologies, and a microservice architecture.

---

## 🚀 Features

- 👨‍🎓 Student Management & Registration
- 🏫 Class & Subject Management
- ✅ Smart AI-based Attendance Tracking (Face Recognition)
- 📊 Attendance Analytics Dashboard
- 📅 Daily Attendance Records
- 📈 Attendance Percentage Calculation
- 🔍 Recent Attendance History
- 🌐 Responsive UI
- ⚡ Real-time Updates
- 🔐 Authentication & Authorization
- 🤖 AI-based attendance workflow support

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React.js, Vite, Tailwind CSS, Axios, React Router |
| Backend    | Node.js, Express.js                             |
| AI Model   | Python, Flask, face_recognition, OpenCV, NumPy  |
| Database   | PostgreSQL 17                                   |
| Container  | Docker, Docker Compose                          |

---

## 📂 Project Structure

```
Attendance.Ai/
├── frontend/           # React + Vite frontend app (port 5173)
├── backend/            # Node.js / Express REST API (port 3000)
│   └── migrations/     # node-pg-migrate SQL migrations
├── model/              # Python Flask AI microservice (port 5000)
│   ├── app.py
│   └── requirements.txt
├── docker-compose.yaml # Orchestrates all services
└── README.md
```

---

## 🐳 Docker Setup (Recommended for Developers)

Docker is the **easiest and recommended** way to run the entire stack locally. A single command spins up:
- ✅ PostgreSQL database
- ✅ Database migrations (auto-run on startup)
- ✅ Node.js backend API
- ✅ Python AI model service
- ✅ React frontend (with hot-reload disabled in container)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24.x
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.x (bundled with Docker Desktop)

Verify your installation:
```bash
docker --version
docker compose version
```

### Step 1 — Clone the Repository

```bash
git clone https://github.com/radhechaudhary/smart_ai_attendance.git
cd Attendance.Ai
```

### Step 2 — Configure Environment Variables

The `docker-compose.yaml` already includes sane defaults for local development. **For production**, you must override the secrets. Create a `.env` file at the project root:

```env
# PostgreSQL
DB_PASSWORD=your_secure_password
DB_PORT=5432
DB_HOST=postgres
DB_USER=postgres
DB_NAME=attendance

# Backend JWT
SECRET_KEY=your_super_secret_key

# Frontend → Backend URL (from the browser's perspective)
VITE_API_URL=http://localhost:3000
```

> [!WARNING]
> Never commit `.env` to version control. It is already listed in `.gitignore`.

### Step 3 — Build & Start All Services

```bash
docker compose up --build
```

This will:
1. Pull the `postgres:17` image
2. Build the **backend**, **model**, and **frontend** Docker images
3. Run database migrations automatically via the `migration` service
4. Start all services

On subsequent runs (no code changes), skip the `--build` flag:
```bash
docker compose up
```

### Step 4 — Access the App

| Service      | URL                        |
|--------------|---------------------------|
| Frontend     | http://localhost:5173      |
| Backend API  | http://localhost:3000      |
| AI Model API | http://localhost:5000      |
| PostgreSQL   | `localhost:5433` (host port) |

### Useful Docker Commands

```bash
# Run in detached (background) mode
docker compose up -d

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f model
docker compose logs -f frontend

# Stop all containers (keeps volumes/data)
docker compose stop

# Stop and remove containers + networks (keeps DB data volume)
docker compose down

# ⚠️ Nuclear reset — removes everything including the database volume
docker compose down -v

# Rebuild a single service after code changes
docker compose up --build backend

# Open a shell inside a running container
docker compose exec backend sh
docker compose exec model bash

# Run a one-off command (e.g., manually trigger migrations)
docker compose run --rm migration npx node-pg-migrate up
```

### Service Architecture

```
Browser
  │
  └──► Frontend (5173) ──► Backend API (3000) ──► PostgreSQL (5432)
                                │
                                └──► AI Model Service (5000)
```

> [!NOTE]
> The `migration` service runs `node-pg-migrate up` once and exits. The `backend` service waits for it (`depends_on: migration`) before starting, ensuring the schema is always ready.

---

## 🖥️ Manual Setup (Without Docker)

Use this if you want to develop a single service locally while running the rest via Docker.

### Prerequisites

- Node.js ≥ 20
- Python ≥ 3.10
- PostgreSQL ≥ 14 (running locally or via `docker compose up postgres`)

### Backend

```bash
cd backend
npm install

# Create .env file
cat > .env <<EOF
DB_PASSWORD=your_password
DB_PORT=5432
DB_HOST=localhost
DB_USER=postgres
DB_NAME=attendance
SECRET_KEY=your_secret_key
MODEL_API_URL=http://localhost:5000
EOF

# Run migrations
npx node-pg-migrate up

# Start dev server (with hot-reload)
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Create .env file
cat > .env <<EOF
VITE_API_URL=http://localhost:3000
EOF

npm run dev
```

### AI Model Service

> [!IMPORTANT]
> The `face_recognition` library requires `cmake` and build tools. On Ubuntu/Debian:
> ```bash
> sudo apt-get install -y build-essential cmake libopenblas-dev liblapack-dev libx11-dev
> ```

```bash
cd model

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate

pip install "setuptools<81"
pip install -r requirements.txt

# Start the Flask server
python app.py
# Or with gunicorn for production-like behaviour:
gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
```

---

## 🔀 Hybrid Dev Workflow (Recommended)

Run the database and AI model in Docker, but run the frontend and backend locally for fast hot-reload:

```bash
# Start only the heavy/stateful services in Docker
docker compose up postgres model -d

# Run backend locally
cd backend && npm run dev

# Run frontend locally (in a new terminal)
cd frontend && npm run dev
```

---

## 📸 Screenshots

<img src="project_SS/ss1.png" alt="Dashboard">
<img src="project_SS/ss2.png" alt="Class Management">
<img src="project_SS/ss3.png" alt="Attendance View">
<img src="project_SS/ss4.png" alt="Analytics">
<img src="project_SS/ss5.png" alt="Student Registration">
<img src="project_SS/ss6.png" alt="AI Attendance">

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).