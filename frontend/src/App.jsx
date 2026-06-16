import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateQuiz from './pages/CreateQuiz'
import HostQuiz from './pages/HostQuiz'
import JoinQuiz from './pages/JoinQuiz'
import QuizRoom from './pages/QuizRoom'
import Results from './pages/Results'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route path="/host/:quizId" element={<HostQuiz />} />
        <Route path="/join" element={<JoinQuiz />} />
        <Route path="/room/:sessionId" element={<QuizRoom />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </div>
  )
}

export default App