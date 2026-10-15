# Quiz MAX

A real time interactive quiz platform built with Node.js, Socket.io and React. Hosts create quizzes and run them live, participants join from their phones with a 6 character code, and a leaderboard appears at the end. The interface is available in English and Russian. Quiz MAX is designed for the MAX Messenger ecosystem, and the mini app integration is planned.

## Features

* Host accounts with login (JWT). Participants join without an account
* Multiple choice and true or false questions
* Optional "None of the above" choice on multiple choice questions, for cases where no written answer fits
* Join quizzes with a unique 6 character code
* Real time question delivery over WebSockets
* Countdown timer per question, controlled by the server
* Points for correct answers and optional penalty points for wrong answers
* After each answer the participant sees the correct option and their own choice
* Live participant list on the host dashboard and a final leaderboard
* My Quizzes page: every quiz a host creates is saved, and can be hosted again, reviewed, extended or deleted
* Past Results page for hosts, with every finished session of their quizzes
* Clear messages under each field when something is missing or wrong, in English and Russian
* CSV export of each finished session, ready to open in Excel
* English and Russian interface, with a switch on every page except the live question screen, and correct Russian word endings
* Quizzes and results are saved in a SQLite database and survive restarts
* Quizzes are private to their host. Other hosts cannot read or change them
* Input validation, login rate limiting and automated tests
* Mobile friendly layout
* Docker image that serves the whole app from one port

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, Socket.io client, Axios |
| Backend | Node.js 20, Express, Socket.io |
| Database | SQLite (better-sqlite3) |
| Security | JWT, bcryptjs, Zod validation, express-rate-limit |
| Testing | Jest (backend), Node test runner (frontend) |
| Packaging and CI | Docker, GitHub Actions |

## Project Structure

```
quiz-max/
├── backend/
│   ├── src/
│   │   ├── controllers/   quiz, auth, history, export and socket logic
│   │   ├── middleware/    JWT check for protected routes
│   │   ├── models/        database connection, schema and stores
│   │   ├── routes/        quiz and auth routes
│   │   ├── validators/    Zod input rules
│   │   ├── tests/         Jest tests
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── scripts/           translation checks and frontend tests
│   ├── src/
│   │   ├── components/    language switch and field error message
│   │   ├── i18n/          English and Russian texts, plural and date helpers
│   │   ├── pages/         Home, Login, CreateQuiz, HostQuiz, JoinQuiz,
│   │   │                  QuizRoom, Results, History, MyQuizzes
│   │   ├── utils/         auth token helpers, API client, server address
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── Dockerfile
├── .github/workflows/ci.yml
└── README.md
```

## Setup

### Prerequisites

* Node.js v20 or newer, and npm
* Git
* Docker (only for the Docker option)

### Option 1: Run with Docker

This runs the whole app, frontend and backend, from one container on one port.

1. Clone the repository

```bash
git clone https://github.com/Nobleteesage/quiz-max.git
cd quiz-max
```

2. Create a secret key. Without it the container refuses to start

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
```

3. Build the image and start the container

```bash
docker build -t quizmax .
docker run -d --name quizmax -p 8080:5000 --env-file .env -v quizmax-data:/data quizmax
```

4. Open http://localhost:8080 and register a host account.

The database lives in the Docker volume `quizmax-data`, so quizzes and results survive restarts and container updates. On Linux you may need to put `sudo` in front of the docker commands. To stop and start the app again, use `docker stop quizmax` and `docker start quizmax`.

### Option 2: Run for development

1. Clone the repository

```bash
git clone https://github.com/Nobleteesage/quiz-max.git
cd quiz-max
```

2. Start the backend (port 5000)

```bash
cd backend
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
npm install
npm run dev
```

3. In a second terminal, start the frontend (port 3000)

```bash
cd frontend
npm install
npm run dev
```

4. Open http://localhost:3000

To test from a phone on the same network, start the frontend with `npm run dev -- --host` and open the Network address it prints.

### Environment variables

| Variable | Used for | Default |
| --- | --- | --- |
| JWT_SECRET | Signs login tokens. Required when NODE_ENV is production | a weak development value |
| PORT | Port the server listens on | 5000 |
| NODE_ENV | Set to production in Docker. Restricts allowed origins | not set |
| CLIENT_URL | Allowed origins in production, separated by commas | http://localhost:3000 |
| DB_PATH | Location of the SQLite file | backend/quizmax.db |
| FRONTEND_DIST | Folder of the built frontend that the server serves | frontend/dist |

### Run the tests

Backend tests:

```bash
cd backend
npm test
```

Frontend tests and translation checks:

```bash
cd frontend
npm test
npm run check:i18n
```

`npm run check:i18n` fails if a text exists in only one language, if a Russian plural form is missing, or if a page uses a text name that does not exist.

GitHub Actions runs the backend tests, the frontend tests, the translation checks, the frontend build and the Docker build on every push.

## How to Use

### Language

Use the **EN** and **RU** buttons at the top right of each page. They are on every page except the live question screen, so participants choose their language on the Join page before the quiz starts. The choice is remembered in the browser. English is the default. Quiz titles, questions and answers stay exactly as the host typed them.

### As a Host

1. Open the app and click **My Quizzes** (or **Create a Quiz** to start a new one)
2. Register an account or log in
3. Press **New Quiz**, fill in the quiz details and add multiple choice or true or false questions (tick **None of the above** on a multiple choice question to add that last choice, and mark it Correct when no written option is right). Every change is saved automatically, and the form tells you which field is missing
4. Find all your quizzes under **My Quizzes**. Press **Questions** to review a quiz, add more questions or remove one, and **Delete** to remove a whole quiz
5. Press **Host** on any saved quiz and share the 6 character join code
6. Click **Start Quiz** when participants have joined
7. Find every finished session later under **Past Results** on the home page
8. Open a session and click **Download CSV** to get its leaderboard as a file

### As a Participant

1. Open the app and click **Join a Quiz**
2. Enter your name and the join code from the host
3. Wait for the host to start
4. Answer each question before the timer runs out
5. View the final leaderboard

### CSV files

The columns are separated by semicolons and the file is UTF-8, so it opens correctly in Excel with Russian settings. The column names follow the interface language chosen when the file is downloaded. A participant name that starts with `=`, `+`, `-` or `@` gets a leading apostrophe, so Excel never runs it as a formula.

## API Endpoints

| Method | Endpoint | Login required | Description |
| --- | --- | --- | --- |
| POST | /api/auth/register | No | Create a host account |
| POST | /api/auth/login | No | Log in and receive a token |
| POST | /api/quiz/create | Yes | Create a new quiz |
| GET | /api/quiz/all | Yes | List your own quizzes, newest first |
| GET | /api/quiz/history | Yes | Past results of your quizzes |
| GET | /api/quiz/history/:sessionId/csv | Yes | Download one finished session as CSV. Add `?lang=ru` for Russian column names |
| GET | /api/quiz/:quizId | Yes | Get one of your quizzes |
| POST | /api/quiz/:quizId/question | Yes | Add a question to your quiz |
| DELETE | /api/quiz/:quizId/question/:questionId | Yes | Remove one question from your quiz |
| DELETE | /api/quiz/:quizId | Yes | Delete your quiz |
| GET | /health | No | Health check |

Protected routes expect the header `Authorization: Bearer YOUR_TOKEN`. A host only sees and changes their own quizzes.

## WebSocket Events

The host sends the login token in the socket handshake. Participants connect without a token.

| Event | Direction | Description |
| --- | --- | --- |
| host:create_session | Client to Server | Host creates a quiz session (owner only) |
| session:created | Server to Client | Session created with join code |
| participant:join | Client to Server | Participant joins with code |
| participant:joined | Server to Client | Confirms participant joined |
| host:participant_joined | Server to Client | Updated participant list for the host |
| host:participant_left | Server to Client | Updated participant list for the host |
| host:start_quiz | Client to Server | Host starts the quiz |
| host:next_question | Client to Server | Host skips to the next question |
| quiz:question | Server to Client | Sends question to all participants |
| participant:answer | Client to Server | Participant submits answer |
| answer:result | Server to Client | Result, score, correct option and chosen option |
| quiz:finished | Server to Client | Sends final leaderboard |
| error | Server to Client | Error message |

## Roadmap

* [x] Persistent database (SQLite)
* [x] Host authentication
* [x] True or false questions
* [x] Quiz history
* [x] Mobile responsive design
* [x] Docker packaging and CI
* [x] Export results to CSV
* [x] Russian language interface
* [x] My Quizzes page and clear form messages
* [ ] MAX Messenger mini app integration
* [ ] Join by phone number through the MAX API (needs MAX developer access)
* [ ] Question image support

## Known Limitations

* Live sessions are kept in memory. If the server restarts during a quiz, that session ends. Saved quizzes and finished results are not affected
* Sign in uses username and password only
* Server error messages are translated by the pages. A message the pages do not know is shown in English

## Team

Quiz MAX started as an Educational Practice Project in 2026. A team of four built the first working version in under 1month, and the lead developer and his team has extended it since.

### Goriola-Obafemi Babatunde Sukanmi, Lead Developer

GitHub: [Nobleteesage](https://github.com/Nobleteesage)

* Project lead and owner of the repository
* Added saved data with SQLite, so quizzes and results survive restarts
* Added host login with JWT and made quizzes private to their owner
* Added input validation, login rate limiting and the automated tests
* Built the mobile layout and the answer highlight that shows the correct option
* Added true or false questions
* Built the Past Results page and the CSV export
* Built the English and Russian interface
* Set up Docker packaging and the GitHub Actions checks

### George Mieabiye David, Backend Engineer

* Built the Node.js and Express server and the REST API
* Built the Socket.io engine: sessions, join codes and question delivery
* Built the server side timer, scoring, penalty points and the leaderboard

### Owolabani Ayobami, Frontend Engineer

* Built the React app and the navigation across the original six screens
* Built the host pages, the participant pages and the results screen
* Styled the interface and made the live screens react to server events

### Adeyemi Olayinka, Systems Architect

* Designed the overall system with the server authoritative approach, where the server decides time and scores
* Defined how the host app, the participant app, the REST API and the WebSocket engine fit together
* Chose the technologies used in the project

## License

MIT License. See the LICENSE file for details.
