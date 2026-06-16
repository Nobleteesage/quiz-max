import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

let socket

function JoinQuiz() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const joinQuiz = () => {
    if (!joinCode || !name) {
      setError('Please enter both your name and the join code')
      return
    }

    setLoading(true)
    setError('')

    socket = io('http://localhost:5000')

    socket.on('connect', () => {
      socket.emit('participant:join', {
        joinCode: joinCode.toUpperCase(),
        name
      })
    })

    socket.on('participant:joined', ({ sessionId, quizTitle }) => {
      setLoading(false)
      navigate(`/room/${sessionId}`, {
        state: { name, quizTitle, socket: null }
      })
      // Store socket globally so QuizRoom can use it
      window._quizSocket = socket
    })

    socket.on('error', ({ message }) => {
      setError(message)
      setLoading(false)
      socket.disconnect()
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a2e',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Join a Quiz</h2>
        <p style={{ color: '#555', marginBottom: '30px' }}>Enter the code from your host</p>

        {error && (
          <div style={{
            background: '#ff475720',
            border: '1px solid #ff4757',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#ff4757'
          }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '14px' }}>
          Your Name
        </label>
        <input
          style={{ marginBottom: '16px' }}
          placeholder="e.g. John"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '14px' }}>
          Join Code
        </label>
        <input
          style={{ marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '20px', fontWeight: '700' }}
          placeholder="XXXXXX"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
        />

        <button
          onClick={joinQuiz}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #ff6584, #ff4757)',
            color: 'white',
            width: '100%',
            padding: '16px',
            fontSize: '18px'
          }}
        >
          {loading ? 'Joining...' : 'Join Quiz'}
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            color: '#555',
            width: '100%',
            padding: '12px',
            marginTop: '10px'
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default JoinQuiz