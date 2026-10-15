import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { isLoggedIn, clearToken } from '../utils/auth'
import { useLanguage } from '../i18n/LanguageContext'
import { serverError } from '../i18n/serverErrors'
import { formatDay } from '../i18n/format.mjs'

function MyQuizzes() {
  const navigate = useNavigate()
  const { lang, t, tn } = useLanguage()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: '/my-quizzes' } })
      return
    }

    api.get('/quiz/all')
      .then((res) => setQuizzes(res.data.quizzes))
      .catch((err) => {
        if (err.response?.status === 401) {
          clearToken()
          navigate('/login', { state: { from: '/my-quizzes' } })
        } else {
          setError(t('myQuizzes.loadError'))
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const deleteQuiz = async (quiz) => {
    if (!window.confirm(t('myQuizzes.confirmDelete', { title: quiz.title }))) return
    setError('')
    try {
      await api.delete(`/quiz/${quiz.id}`)
      setQuizzes(quizzes.filter((q) => q.id !== quiz.id))
    } catch (err) {
      setError(serverError(t, err.response?.data?.error) || t('myQuizzes.deleteError'))
    }
  }

  const cardStyle = {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: 'clamp(18px, 5vw, 30px)',
    marginBottom: '20px'
  }

  const smallButton = {
    padding: '10px 16px',
    fontSize: '14px'
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 20px 40px' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>{t('myQuizzes.title')}</h2>
      <p style={{ color: '#555', marginBottom: '24px' }}>{t('myQuizzes.subtitle')}</p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/create')}
          style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: 'white', flex: 1, minWidth: '160px' }}
        >
          {t('myQuizzes.new')}
        </button>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'transparent', border: '2px solid #333', color: '#aaa', flex: 1, minWidth: '160px' }}
        >
          {t('common.backHome')}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {error}
        </div>
      )}

      {loading && <p style={{ color: '#aaa' }}>{t('history.loading')}</p>}

      {!loading && !error && quizzes.length === 0 && (
        <div style={cardStyle}>
          <p style={{ color: '#aaa' }}>{t('myQuizzes.empty')}</p>
        </div>
      )}

      {quizzes.map((quiz) => {
        const count = quiz.questions.length
        return (
          <div key={quiz.id} style={cardStyle} data-testid="quiz-card">
            <p style={{ fontSize: '1.2rem', fontWeight: '700', wordBreak: 'break-word' }}>{quiz.title}</p>
            {quiz.description && (
              <p style={{ color: '#aaa', fontSize: '14px', marginTop: '4px', wordBreak: 'break-word' }}>{quiz.description}</p>
            )}
            <p style={{ color: '#888', fontSize: '14px', marginTop: '10px' }}>
              {tn('history.questions', count)}
              {' · '}
              {t('myQuizzes.timeLine', { time: t('quiz.secondsShort', { count: quiz.timeLimit }) })}
              {' · '}
              {t('myQuizzes.created', { date: formatDay(lang, quiz.createdAt) })}
            </p>
            <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
              {t('create.joinCode')} <span style={{ color: 'white', fontWeight: '700', letterSpacing: '2px' }}>{quiz.joinCode}</span>
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button
                onClick={() => navigate(`/host/${quiz.id}`)}
                disabled={count === 0}
                style={{
                  ...smallButton,
                  background: count === 0 ? '#333' : 'linear-gradient(135deg, #2ecc71, #27ae60)',
                  color: 'white'
                }}
              >
                {t('myQuizzes.host')}
              </button>
              <button
                onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
                style={{ ...smallButton, background: '#6c63ff', color: 'white' }}
              >
                {t('myQuizzes.edit')}
              </button>
              <button
                onClick={() => deleteQuiz(quiz)}
                style={{ ...smallButton, background: 'transparent', border: '1px solid #ff4757', color: '#ff4757' }}
              >
                {t('myQuizzes.delete')}
              </button>
            </div>

            {count === 0 && (
              <p style={{ color: '#aaa', fontSize: '13px', marginTop: '10px', fontStyle: 'italic' }}>{t('myQuizzes.noQuestions')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default MyQuizzes
