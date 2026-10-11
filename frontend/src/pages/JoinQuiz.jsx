import { useState } from 'react'
import { SERVER_URL } from '../utils/config'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useLanguage } from '../i18n/LanguageContext'
import { serverError } from '../i18n/serverErrors'

let socket

function JoinQuiz() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [joinCode, setJoinCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const joinQuiz = () => {
    if (!joinCode || !name) {
      setError(t('join.errorMissing'))
      return
    }

    setLoading(true)
    setError('')

    socket = io(SERVER_URL)

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
      setError(serverError(t, message))
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
      minHeight: '100dvh',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a2e',
        borderRadius: '16px',
        padding: 'clamp(20px, 6vw, 40px)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>{t('join.title')}</h2>
        <p style={{ color: '#555', marginBottom: '30px' }}>{t('join.subtitle')}</p>

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
          {t('join.nameLabel')}
        </label>
        <input
          style={{ marginBottom: '16px' }}
          placeholder={t('join.namePlaceholder')}
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '14px' }}>
          {t('join.codeLabel')}
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
          {loading ? t('join.submitting') : t('join.submit')}
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
          {t('common.backHome')}
        </button>
      </div>
    </div>
  )
}

export default JoinQuiz
