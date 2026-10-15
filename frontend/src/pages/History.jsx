import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { isLoggedIn, clearToken } from '../utils/auth'
import { downloadCsv } from '../utils/download'
import { useLanguage } from '../i18n/LanguageContext'
import { formatDate, formatDuration } from '../i18n/format.mjs'

function History() {
  const navigate = useNavigate()
  const { lang, t, tn } = useLanguage()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openSession, setOpenSession] = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: '/history' } })
      return
    }

    api.get('/quiz/history')
      .then((res) => setHistory(res.data.history))
      .catch((err) => {
        if (err.response?.status === 401) {
          clearToken()
          navigate('/login', { state: { from: '/history' } })
        } else {
          setError('load')
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const download = async (sessionId) => {
    const ok = await downloadCsv(sessionId, lang)
    if (!ok) alert(t('history.downloadError'))
  }

  const cardStyle = {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: 'clamp(18px, 5vw, 30px)',
    marginBottom: '20px'
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 20px 40px' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>{t('history.title')}</h2>
      <p style={{ color: '#555', marginBottom: '30px' }}>{t('history.subtitle')}</p>

      {error && (
        <div style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {t('history.error')}
        </div>
      )}

      {loading && <p style={{ color: '#aaa' }}>{t('history.loading')}</p>}

      {!loading && !error && history.length === 0 && (
        <div style={cardStyle}>
          <p style={{ color: '#aaa' }}>{t('history.empty')}</p>
        </div>
      )}

      {history.map((quiz) => (
        <div key={quiz.quizId} style={cardStyle}>
          <h3 style={{ marginBottom: '4px' }}>{quiz.title}</h3>
          <p style={{ color: '#555', fontSize: '13px', marginBottom: '16px' }}>
            {tn('history.questions', quiz.questionCount)}, {tn('history.played', quiz.sessions.length)}
          </p>

          {quiz.sessions.map((session) => {
            const isOpen = openSession === session.sessionId
            return (
              <div key={session.sessionId} style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => setOpenSession(isOpen ? null : session.sessionId)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: '#0f0f1a',
                    color: 'white',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <div>{formatDate(lang, session.playedAt)}</div>
                  <div style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>
                    {tn('history.players', session.participantCount)}
                    {session.topName
                      ? ', ' + t('history.winner', { name: session.topName, points: tn('quiz.points', session.topScore) })
                      : ''}
                  </div>
                </button>

                {isOpen && (
                  <div style={{ padding: '10px 4px 0' }}>
                    <button
                      onClick={() => download(session.sessionId)}
                      style={{ background: '#6c63ff', color: 'white', padding: '8px 16px', fontSize: '13px', marginBottom: '8px' }}
                    >
                      {t('history.download')}
                    </button>
                    {session.results.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#0f0f1a',
                          borderRadius: '8px',
                          marginBottom: '6px'
                        }}
                      >
                        <span>{i + 1}. {p.name}</span>
                        <span style={{ color: '#6c63ff', fontWeight: '700' }}>
                          {t('quiz.scoreShort', { score: p.score })} <span style={{ color: '#555', fontWeight: '400' }}>({formatDuration(t, p.timeTaken)})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      <button
        onClick={() => navigate('/')}
        style={{ background: 'transparent', color: '#555', width: '100%', padding: '12px' }}
      >
        {t('common.backHome')}
      </button>
    </div>
  )
}

export default History
