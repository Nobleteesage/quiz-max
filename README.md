# Quiz MAX

A real-time interactive quiz platform built with Node.js, Socket.io, and React — featuring live participant management, countdown timers, dynamic scoring with penalty support, and an instant leaderboard. Designed as a mini-app for the MAX Messenger ecosystem.

## Features

- Create quizzes with custom questions and answer options
- Join quizzes using a unique 6-character join code
- Real-time question delivery via WebSockets
- Countdown timer per question (server-authoritative)
- Points awarded for correct answers
- Penalty points deducted for wrong answers
- Live participant tracking on host dashboard
- Final leaderboard showing scores and time taken

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Socket.io-client |
| Backend | Node.js, Express, Socket.io |
| Real-time | WebSockets via Socket.io |
| Styling | Pure CSS with CSS variables |

## Project Structure

```
quiz-max/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── quizController.js
│   │   │   └── socketController.js
│   │   ├── models/
│   │   │   └── quizStore.js
│   │   ├── routes/
│   │   │   └── quizRoutes.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CreateQuiz.jsx
│   │   │   ├── HostQuiz.jsx
│   │   │   ├── JoinQuiz.jsx
│   │   │   ├── QuizRoom.jsx
│   │   │   └── Results.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v20+
- npm v10+
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Nobleteesage/quiz-max.git
cd quiz-max
```

**2. Setup the backend**
```bash
cd backend
npm install
npm run dev
```

**3. Setup the frontend**
```bash
cd ../frontend
npm install
npm run dev
```

**4. Open your browser**
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

## How to Use

### As a Host
1. Go to the home page and click **Create a Quiz**
2. Fill in the quiz details and add questions
3. Share the **6-character join code** with participants
4. Click **Start Quiz** when participants have joined
5. View live results on the leaderboard at the end

### As a Participant
1. Go to the home page and click **Join a Quiz**
2. Enter your name and the join code from the host
3. Wait for the host to start
4. Answer questions before the timer runs out
5. View your final score on the leaderboard

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/quiz/create | Create a new quiz |
| GET | /api/quiz/all | Get all quizzes |
| GET | /api/quiz/:quizId | Get a single quiz |
| POST | /api/quiz/:quizId/question | Add a question to a quiz |
| DELETE | /api/quiz/:quizId | Delete a quiz |

## WebSocket Events

| Event | Direction | Description |
|---|---|---|
| host:create_session | Client to Server | Host creates a quiz session |
| session:created | Server to Client | Session created with join code |
| participant:join | Client to Server | Participant joins with code |
| participant:joined | Server to Client | Confirms participant joined |
| host:start_quiz | Client to Server | Host starts the quiz |
| quiz:question | Server to Client | Sends question to all participants |
| participant:answer | Client to Server | Participant submits answer |
| answer:result | Server to Client | Returns result and score |
| quiz:finished | Server to Client | Sends final leaderboard |

## Roadmap

- [ ] Persistent database (PostgreSQL)
- [ ] User authentication and profiles
- [ ] MAX Messenger mini-app integration
- [ ] Question image support
- [ ] Quiz history and analytics dashboard
- [ ] Mobile responsive design improvements
- [ ] Export results to PDF

## Author: Goriola-Obafemi Babatunde

**Nobleteesage** — [github.com/Nobleteesage](https://github.com/Nobleteesage)

## License

MIT License — see [LICENSE](LICENSE) for details.
