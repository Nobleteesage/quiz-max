import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { getToken } from '../utils/auth'
import { SERVER_URL } from '../utils/config'
import { useLanguage } from '../i18n/LanguageContext'
import { serverError } from '../i18n/serverErrors'

let socket

function HostQuiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [session, setSession] = useState(null)
  const [participants, setParticipants] = useState([])
  const [status, setStatus] = useState('connecting')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    socket = io(SERVER_URL, {
      auth: { token: getToken() }
    })

    socket.on('connect', () => {
      setStatus('connected')
      socket.emit('host:create_session', { quizId })
    })

    socket.on('session:created', ({ sessionId, joinCode, quiz }) => {
      setSession({ sessionId, quiz })
      setJoinCode(joinCode)
      setStatus('waiting')
    })

    socket.on('host:participant_joined', ({ participants }) => {
      setParticipants(participants)
    })

    socket.on('host:participant_left', ({ participants }) => {
      setParticipants(participants)
    })

    socket.on('quiz:finished', ({ results }) => {
      navigate('/results', { state: { results } })
    })

    socket.on('error', ({ message }) => {
      setError(serverError(t, message))
    })

    return () => {
      socket.disconnect()
    }
  }, [quizId])

  const startQuiz = () => {
    if (!session) return
    socket.emit('host:start_quiz', { sessionId: session.sessionId })
    setStatus('active')
  }

  const nextQuestion = () => {
    if (!session) return
    socket.emit('host:next_question', { sessionId: session.sessionId })
  }

  const cardStyle = {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: 'clamp(18px, 5vw, 30px)',
    marginBottom: '20px'
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 20px 40px' }}>
      <h2 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>{t('host.title')}</h2>

      {error && (
        <div style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {error}
        </div>
      )}

      {status === 'connecting' && (
        <div style={cardStyle}>
          <p style={{ color: '#aaa' }}>{t('host.connecting')}</p>
        </div>
      )}

      {(status === 'waiting' || status === 'active') && session && (
        <>
          <div style={{ ...cardStyle, borderLeft: '4px solid #6c63ff' }}>
            <p style={{ color: '#aaa', fontSize: '14px' }}>{t('host.quiz')}</p>
            <p style={{ fontSize: '1.3rem', fontWeight: '700' }}>{session.quiz.title}</p>
            <p style={{ color: '#aaa', marginTop: '10px', fontSize: '14px' }}>{t('host.joinCode')}</p>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6c63ff', letterSpacing: '8px' }}>
              {joinCode}
            </p>
            <p style={{ color: '#555', fontSize: '12px' }}>{t('host.shareCode')}</p>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>{t('host.participants', { count: participants.length })}</h3>
              <span style={{
                background: status === 'active' ? '#2ecc7120' : '#6c63ff20',
                color: status === 'active' ? '#2ecc71' : '#6c63ff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {status === 'active' ? t('host.live') : t('host.waiting')}
              </span>
            </div>

            {participants.length === 0 ? (
              <p style={{ color: '#555', fontStyle: 'italic' }}>{t('host.noParticipants')}</p>
            ) : (
              participants.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px',
                  background: '#0f0f1a',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <span>{i + 1}. {p.name}</span>
                  <span style={{ color: '#6c63ff', fontWeight: '700' }}>{t('quiz.scoreShort', { score: p.score })}</span>
                </div>
              ))
            )}
          </div>

          {status === 'waiting' && (
            <button
              onClick={startQuiz}
              disabled={participants.length === 0}
              style={{
                background: participants.length === 0
                  ? '#333'
                  : 'linear-gradient(135deg, #2ecc71, #27ae60)',
                color: 'white',
                width: '100%',
                padding: '16px',
                fontSize: '18px'
              }}
            >
              {participants.length === 0 ? t('host.waitingButton') : t('host.start')}
            </button>
          )}

          {status === 'active' && (
            <button
              onClick={nextQuestion}
              style={{
                background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                color: 'white',
                width: '100%',
                padding: '16px',
                fontSize: '18px'
              }}
            >
              {t('host.next')}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default HostQuiz
