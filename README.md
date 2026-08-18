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

## 🐳 Getting Started with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (includes Docker Compose)

### Run the App

```bash
git clone https://github.com/radhechaudhary/smart_ai_attendance.git
cd Attendance.Ai
docker compose up --build
```

That's it! Once running, open your browser:

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

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