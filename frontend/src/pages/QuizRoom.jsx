import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'

function QuizRoom() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { name, quizTitle } = location.state || {}

  const [question, setQuestion] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [status, setStatus] = useState('waiting')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  useEffect(() => {
    const socket = window._quizSocket
    if (!socket) {
      navigate('/')
      return
    }

    socket.on('quiz:question', (data) => {
      setQuestion(data)
      setAnswered(false)
      setResult(null)
      setTimeLeft(data.timeLimit)
      setStatus('active')
      setQuestionIndex(data.questionIndex)
      setTotalQuestions(data.totalQuestions)
    })

    socket.on('answer:result', (data) => {
      setResult(data)
      setScore(data.currentScore)
      setAnswered(true)
    })

    socket.on('quiz:finished', ({ results }) => {
      navigate('/results', { state: { results, myName: name } })
    })

    return () => {
      socket.off('quiz:question')
      socket.off('answer:result')
      socket.off('quiz:finished')
    }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0 || answered) return
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, answered])

  const submitAnswer = (index) => {
    if (answered) return
    const socket = window._quizSocket
    socket.emit('participant:answer', { sessionId, answerIndex: index })
  }

  const timerColor = timeLeft > 10 ? '#2ecc71' : timeLeft > 5 ? '#f39c12' : '#ff4757'

  if (status === 'waiting') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎮</div>
          <h2 style={{ marginBottom: '10px' }}>You're in!</h2>
          <p style={{ color: '#aaa', marginBottom: '8px' }}>Welcome, <strong style={{ color: 'white' }}>{name}</strong></p>
          <p style={{ color: '#6c63ff', fontWeight: '600' }}>{quizTitle}</p>
          <p style={{ color: '#555', marginTop: '20px', fontSize: '14px' }}>
            Waiting for the host to start the quiz...
          </p>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#6c63ff',
                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`
              }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <span style={{ color: '#aaa', fontSize: '14px' }}>
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span style={{
          background: '#1a1a2e',
          padding: '6px 16px',
          borderRadius: '20px',
          fontWeight: '700',
          color: '#6c63ff'
        }}>
          {score} pts
        </span>
      </div>

      {/* Timer */}
      <div style={{
        background: '#1a1a2e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ color: '#aaa', fontSize: '14px' }}>Time left</span>
        <div style={{ flex: 1, background: '#0f0f1a', borderRadius: '8px', height: '8px' }}>
          <div style={{
            width: `${(timeLeft / (question?.timeLimit || 1)) * 100}%`,
            height: '100%',
            background: timerColor,
            borderRadius: '8px',
            transition: 'width 1s linear, background 0.3s'
          }} />
        </div>
        <span style={{ color: timerColor, fontWeight: '700', fontSize: '18px', minWidth: '32px' }}>
          {timeLeft}s
        </span>
      </div>

      {/* Question */}
      {question && (
        <div style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '10px' }}>
            {question.points} points
          </p>
          <h2 style={{ fontSize: '1.4rem', lineHeight: '1.5' }}>{question.text}</h2>
        </div>
      )}

      {/* Answer Options */}
      {question && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {question.options.map((option, i) => {
            let bg = '#1a1a2e'
            let border = '2px solid transparent'

            if (answered && result) {
              const isCorrect = i === question.options.indexOf(option) && result.isCorrect && i === question.options.findIndex((_, idx) => idx === i)
              if (result.isCorrect && answered) {
                bg = i === question.correctAnswer ? '#2ecc7120' : '#1a1a2e'
                border = i === question.correctAnswer ? '2px solid #2ecc71' : '2px solid transparent'
              } else {
                bg = '#ff475720'
                border = '2px solid #ff4757'
              }
            }

            return (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                disabled={answered}
                style={{
                  background: bg,
                  border,
                  color: 'white',
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '16px',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  opacity: answered ? 0.8 : 1
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: '28px',
                  height: '28px',
                  background: '#0f0f1a',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '28px',
                  marginRight: '12px',
                  fontSize: '14px',
                  fontWeight: '700'
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      )}

      {/* Result feedback */}
      {answered && result && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '12px',
          background: result.isCorrect ? '#2ecc7120' : '#ff475720',
          border: `1px solid ${result.isCorrect ? '#2ecc71' : '#ff4757'}`,
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: '700', color: result.isCorrect ? '#2ecc71' : '#ff4757' }}>
            {result.isCorrect ? 'Correct!' : 'Wrong!'}
          </p>
          <p style={{ color: '#aaa', marginTop: '4px' }}>
            {result.pointsEarned >= 0 ? '+' : ''}{result.pointsEarned} points
          </p>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
            Waiting for next question...
          </p>
        </div>
      )}
    </div>
  )
}

export default QuizRoom