import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { isLoggedIn, clearToken } from '../utils/auth'
import { useLanguage } from '../i18n/LanguageContext'
import { serverError } from '../i18n/serverErrors'

const emptyMultipleChoice = {
  type: 'multiple_choice',
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  points: 10
}

const emptyTrueFalse = {
  type: 'true_false',
  text: '',
  options: ['', ''],
  correctAnswer: 0,
  points: 10
}

function CreateQuiz() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    penaltyPoints: 0
  })

  const [questionForm, setQuestionForm] = useState(emptyMultipleChoice)
  const [questions, setQuestions] = useState([])

  const isTrueFalse = questionForm.type === 'true_false'

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
    }
  }, [navigate])

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      clearToken()
      navigate('/login')
      return true
    }
    return false
  }

  const switchType = (type) => {
    if (type === questionForm.type) return
    setError('')
    setQuestionForm(type === 'true_false' ? emptyTrueFalse : emptyMultipleChoice)
  }

  const createQuiz = async () => {
    if (!quizForm.title) {
      setError(t('create.errorTitle'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/quiz/create', quizForm)
      setQuiz(res.data.quiz)
      setStep(2)
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(serverError(t, err.response?.data?.error) || t('create.errorCreate'))
      }
    }
    setLoading(false)
  }

  const addQuestion = async () => {
    if (!questionForm.text) {
      setError(t('create.errorQuestionText'))
      return
    }
    if (!isTrueFalse && questionForm.options.some(o => !o)) {
      setError(t('create.errorOptions'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = isTrueFalse
        ? { ...questionForm, options: [t('create.true'), t('create.false')] }
        : questionForm
      const res = await api.post(`/quiz/${quiz.id}/question`, payload)
      setQuestions([...questions, res.data.question])
      setQuestionForm(isTrueFalse ? emptyTrueFalse : emptyMultipleChoice)
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(serverError(t, err.response?.data?.error) || t('create.errorAddQuestion'))
      }
    }
    setLoading(false)
  }

  const updateOption = (index, value) => {
    const newOptions = [...questionForm.options]
    newOptions[index] = value
    setQuestionForm({ ...questionForm, options: newOptions })
  }

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '64px 20px 40px'
  }

  const cardStyle = {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: 'clamp(18px, 5vw, 30px)',
    marginBottom: '20px'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#aaa',
    fontSize: '14px'
  }

  const inputStyle = {
    marginBottom: '16px'
  }

  const typeButtonStyle = (active) => ({
    flex: 1,
    background: active ? '#6c63ff' : '#0f0f1a',
    color: 'white',
    padding: '12px'
  })

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>
        {step === 1 ? t('create.titleNew') : t('create.titleQuestions')}
      </h2>

      {error && (
        <div style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div style={cardStyle}>
          <label style={labelStyle}>{t('create.quizTitleLabel')}</label>
          <input
            style={inputStyle}
            placeholder={t('create.quizTitlePlaceholder')}
            value={quizForm.title}
            onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
          />

          <label style={labelStyle}>{t('create.descriptionLabel')}</label>
          <input
            style={inputStyle}
            placeholder={t('create.descriptionPlaceholder')}
            value={quizForm.description}
            onChange={e => setQuizForm({ ...quizForm, description: e.target.value })}
          />

          <label style={labelStyle}>{t('create.timeLabel')}</label>
          <input
            style={inputStyle}
            type="number"
            min="5"
            max="120"
            value={quizForm.timeLimit}
            onChange={e => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
          />

          <label style={labelStyle}>{t('create.penaltyLabel')}</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={quizForm.penaltyPoints}
            onChange={e => setQuizForm({ ...quizForm, penaltyPoints: parseInt(e.target.value) })}
          />

          <button
            onClick={createQuiz}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: 'white', width: '100%', padding: '14px' }}
          >
            {loading ? t('create.submitting') : t('create.submit')}
          </button>
        </div>
      )}

      {step === 2 && quiz && (
        <>
          <div style={{ ...cardStyle, borderLeft: '4px solid #6c63ff' }}>
            <p style={{ color: '#6c63ff', fontWeight: '700', fontSize: '1.1rem' }}>{t('create.created')}</p>
            <p style={{ color: '#aaa', marginTop: '4px' }}>
              {t('create.joinCode')} <span style={{ color: 'white', fontWeight: '700', fontSize: '1.4rem' }}>{quiz.joinCode}</span>
            </p>
            <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '4px' }}>{t('create.shareCode')}</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginBottom: '20px' }}>{t('create.addQuestionTitle')}</h3>

            <label style={labelStyle}>{t('create.typeLabel')}</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => switchType('multiple_choice')}
                style={typeButtonStyle(!isTrueFalse)}
              >
                {t('create.typeMultiple')}
              </button>
              <button
                onClick={() => switchType('true_false')}
                style={typeButtonStyle(isTrueFalse)}
              >
                {t('create.typeTrueFalse')}
              </button>
            </div>

            <label style={labelStyle}>{t('create.questionLabel')}</label>
            <input
              style={inputStyle}
              placeholder={isTrueFalse ? t('create.questionPlaceholderTrueFalse') : t('create.questionPlaceholderMultiple')}
              value={questionForm.text}
              onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })}
            />

            <label style={labelStyle}>
              {isTrueFalse ? t('create.pickCorrect') : t('create.optionsLabel')}
            </label>
            {questionForm.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {isTrueFalse ? (
                  <div style={{ flex: 1, padding: '12px 16px', background: '#0f0f1a', borderRadius: '8px', color: 'white' }}>
                    {i === 0 ? t('create.true') : t('create.false')}
                  </div>
                ) : (
                  <input
                    placeholder={t('create.optionPlaceholder', { number: i + 1 })}
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    style={{ flex: 1 }}
                  />
                )}
                <input
                  type="radio"
                  name="correct"
                  checked={questionForm.correctAnswer === i}
                  onChange={() => setQuestionForm({ ...questionForm, correctAnswer: i })}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ color: '#aaa', fontSize: '12px' }}>{t('create.correct')}</span>
              </div>
            ))}

            <label style={labelStyle}>{t('create.pointsLabel')}</label>
            <input
              style={inputStyle}
              type="number"
              min="1"
              value={questionForm.points}
              onChange={e => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
            />

            <button
              onClick={addQuestion}
              disabled={loading}
              style={{ background: '#6c63ff', color: 'white', width: '100%', padding: '14px', marginBottom: '10px' }}
            >
              {loading ? t('create.adding') : t('create.addQuestion')}
            </button>
          </div>

          {questions.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '16px' }}>{t('create.questionsAdded', { count: questions.length })}</h3>
              {questions.map((q, i) => (
                <div key={q.id} style={{ padding: '10px', background: '#0f0f1a', borderRadius: '8px', marginBottom: '8px' }}>
                  <p style={{ color: '#aaa', fontSize: '12px' }}>
                    {t('create.questionNumber', { number: i + 1 })} ({q.type === 'true_false' ? t('create.typeTrueFalse') : t('create.typeMultiple')})
                  </p>
                  <p>{q.text}</p>
                </div>
              ))}

              <button
                onClick={() => navigate(`/host/${quiz.id}`)}
                style={{ background: 'linear-gradient(135deg, #ff6584, #ff4757)', color: 'white', width: '100%', padding: '14px', marginTop: '16px' }}
              >
                {t('create.startHosting')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CreateQuiz
