import { Routes, Route, useLocation } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateQuiz from './pages/CreateQuiz'
import HostQuiz from './pages/HostQuiz'
import JoinQuiz from './pages/JoinQuiz'
import QuizRoom from './pages/QuizRoom'
import Results from './pages/Results'
import History from './pages/History'
import MyQuizzes from './pages/MyQuizzes'

// Pages that show the EN and RU buttons. The quiz room is left out on purpose,
// because the buttons would sit on top of the score during a question.
const SWITCHER_PATHS = ['/', '/join', '/results', '/login', '/create', '/history', '/my-quizzes']

function App() {
  const location = useLocation()
  const showSwitcher =
    SWITCHER_PATHS.includes(location.pathname) ||
    location.pathname.startsWith('/host/') ||
    location.pathname.startsWith('/quiz/')

  return (
    <LanguageProvider>
      <div className="app">
        {showSwitcher && <LanguageSwitcher />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreateQuiz />} />
          <Route path="/my-quizzes" element={<MyQuizzes />} />
          <Route path="/quiz/:quizId/edit" element={<CreateQuiz />} />
          <Route path="/host/:quizId" element={<HostQuiz />} />
          <Route path="/join" element={<JoinQuiz />} />
          <Route path="/room/:sessionId" element={<QuizRoom />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </LanguageProvider>
  )
}

export default App
