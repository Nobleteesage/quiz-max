import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import { isLoggedIn, clearToken } from '../utils/auth'
import { useLanguage } from '../i18n/LanguageContext'
import { serverError } from '../i18n/serverErrors'
import FieldError from '../components/FieldError'
import { validateQuizForm, validateQuestionForm, hasErrors } from '../utils/validate.mjs'
import { focusFirstError, invalidStyle } from '../utils/focusError'

// Number boxes keep their text while the host types, and are turned into numbers when sent
const emptyMultipleChoice = {
  type: 'multiple_choice',
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  points: '10'
}

const emptyTrueFalse = {
  type: 'true_false',
  text: '',
  options: ['', ''],
  correctAnswer: 0,
  points: '10'
}

// This page has two jobs. At /create it makes a new quiz.
// At /quiz/:quizId/edit it reopens a saved quiz to review it or add more questions.
function CreateQuiz() {
  const navigate = useNavigate()
  const { quizId: editId } = useParams()
  const { t } = useLanguage()
  const [step, setStep] = useState(editId ? 0 : 1)
  const [quiz, setQuiz] = useState(null)
  const [justCreated, setJustCreated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [quizErrors, setQuizErrors] = useState({})
  const [questionErrors, setQuestionErrors] = useState({})

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: '30',
    penaltyPoints: '0'
  })

  const [questionForm, setQuestionForm] = useState(emptyMultipleChoice)
  const [questions, setQuestions] = useState([])

  const isTrueFalse = questionForm.type === 'true_false'

  const goToLogin = () => {
    clearToken()
    navigate('/login', { state: { from: editId ? `/quiz/${editId}/edit` : '/create' } })
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: editId ? `/quiz/${editId}/edit` : '/create' } })
      return
    }
    if (!editId) return

    api.get(`/quiz/${editId}`)
      .then((res) => {
        setQuiz(res.data.quiz)
        setQuestions(res.data.quiz.questions)
        setStep(2)
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          goToLogin()
        } else {
          setError(serverError(t, err.response?.data?.error) || t('create.loadError'))
          setStep(-1)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  // Once every highlighted field is fixed, the summary at the top goes away too
  useEffect(() => {
    if (error === t('common.fixFields') && !hasErrors(quizErrors) && !hasErrors(questionErrors)) {
      setError('')
    }
  }, [quizErrors, questionErrors, error, t])

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      goToLogin()
      return true
    }
    return false
  }

  const switchType = (type) => {
    if (type === questionForm.type) return
    setError('')
    setNotice('')
    setQuestionErrors({})
    setQuestionForm(type === 'true_false' ? emptyTrueFalse : emptyMultipleChoice)
  }

  const changeQuizField = (field, value) => {
    setQuizForm({ ...quizForm, [field]: value })
    setQuizErrors({ ...quizErrors, [field]: '' })
  }

  const changeQuestionField = (field, value) => {
    setQuestionForm({ ...questionForm, [field]: value })
    setQuestionErrors({ ...questionErrors, [field]: '' })
    setNotice('')
  }

  const createQuiz = async () => {
    const problems = validateQuizForm(quizForm)
    if (hasErrors(problems)) {
      setQuizErrors(problems)
      setError(t('common.fixFields'))
      focusFirstError()
      return
    }
    setQuizErrors({})
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/quiz/create', {
        title: quizForm.title.trim(),
        description: quizForm.description,
        timeLimit: Number(quizForm.timeLimit),
        penaltyPoints: Number(quizForm.penaltyPoints)
      })
      setQuiz(res.data.quiz)
      setJustCreated(true)
      setStep(2)
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(serverError(t, err.response?.data?.error) || t('create.errorCreate'))
      }
    }
    setLoading(false)
  }

  const addQuestion = async () => {
    const problems = validateQuestionForm(questionForm)
    if (hasErrors(problems)) {
      setQuestionErrors(problems)
      setError(t('common.fixFields'))
      setNotice('')
      focusFirstError()
      return
    }
    setQuestionErrors({})
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const payload = {
        ...questionForm,
        text: questionForm.text.trim(),
        points: Number(questionForm.points),
        options: isTrueFalse
          ? [t('create.true'), t('create.false')]
          : questionForm.options.map(o => o.trim())
      }
      const res = await api.post(`/quiz/${quiz.id}/question`, payload)
      setQuestions([...questions, res.data.question])
      setQuestionForm(isTrueFalse ? emptyTrueFalse : emptyMultipleChoice)
      setNotice(t('create.questionAdded'))
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(serverError(t, err.response?.data?.error) || t('create.errorAddQuestion'))
      }
    }
    setLoading(false)
  }

  const removeQuestion = async (question) => {
    if (!window.confirm(t('create.confirmRemove'))) return
    setError('')
    setNotice('')
    try {
      await api.delete(`/quiz/${quiz.id}/question/${question.id}`)
      setQuestions(questions.filter(q => q.id !== question.id))
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(serverError(t, err.response?.data?.error) || t('create.removeError'))
      }
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...questionForm.options]
    newOptions[index] = value
    setQuestionForm({ ...questionForm, options: newOptions })
    if (questionErrors.options) {
      const newErrors = [...questionErrors.options]
      newErrors[index] = ''
      setQuestionErrors({ ...questionErrors, options: newErrors })
    }
    setNotice('')
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

  const inputWithError = (message) => ({ ...inputStyle, ...(message ? invalidStyle : {}) })

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>
        {step === 1 ? t('create.titleNew') : t('create.titleQuestions')}
      </h2>

      {error && (
        <div role="alert" style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {error}
        </div>
      )}

      {step === -1 && (
        <button
          onClick={() => navigate('/my-quizzes')}
          style={{ background: 'transparent', border: '2px solid #333', color: '#aaa', width: '100%', padding: '14px' }}
        >
          {t('common.myQuizzes')}
        </button>
      )}

      {step === 1 && (
        <div style={cardStyle}>
          <label style={labelStyle}>{t('create.quizTitleLabel')}</label>
          <input
            style={inputWithError(quizErrors.title)}
            aria-invalid={!!quizErrors.title}
            placeholder={t('create.quizTitlePlaceholder')}
            value={quizForm.title}
            onChange={e => changeQuizField('title', e.target.value)}
          />
          <FieldError message={quizErrors.title && t(quizErrors.title)} />

          <label style={labelStyle}>{t('create.descriptionLabel')}</label>
          <input
            style={inputStyle}
            placeholder={t('create.descriptionPlaceholder')}
            value={quizForm.description}
            onChange={e => changeQuizField('description', e.target.value)}
          />

          <label style={labelStyle}>{t('create.timeLabel')}</label>
          <input
            style={inputWithError(quizErrors.timeLimit)}
            aria-invalid={!!quizErrors.timeLimit}
            inputMode="numeric"
            value={quizForm.timeLimit}
            onChange={e => changeQuizField('timeLimit', e.target.value)}
          />
          <FieldError message={quizErrors.timeLimit && t(quizErrors.timeLimit)} />

          <label style={labelStyle}>{t('create.penaltyLabel')}</label>
          <input
            style={inputWithError(quizErrors.penaltyPoints)}
            aria-invalid={!!quizErrors.penaltyPoints}
            inputMode="numeric"
            value={quizForm.penaltyPoints}
            onChange={e => changeQuizField('penaltyPoints', e.target.value)}
          />
          <FieldError message={quizErrors.penaltyPoints && t(quizErrors.penaltyPoints)} />

          <button
            onClick={createQuiz}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: 'white', width: '100%', padding: '14px', marginBottom: '10px' }}
          >
            {loading ? t('create.submitting') : t('create.submit')}
          </button>

          <button
            onClick={() => navigate('/my-quizzes')}
            style={{ background: 'transparent', color: '#aaa', width: '100%', padding: '12px' }}
          >
            {t('common.myQuizzes')}
          </button>
        </div>
      )}

      {step === 2 && quiz && (
        <>
          <div style={{ ...cardStyle, borderLeft: '4px solid #6c63ff' }}>
            <p style={{ color: '#6c63ff', fontWeight: '700', fontSize: '1.1rem' }}>
              {justCreated ? t('create.created') : t('create.editing', { title: quiz.title })}
            </p>
            <p style={{ color: '#aaa', marginTop: '4px' }}>
              {t('create.joinCode')} <span style={{ color: 'white', fontWeight: '700', fontSize: '1.4rem' }}>{quiz.joinCode}</span>
            </p>
            <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '4px' }}>{t('create.shareCode')}</p>
            <p style={{ color: '#2ecc71', fontSize: '0.85rem', marginTop: '8px' }}>{t('create.autosaved')}</p>
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
              style={inputWithError(questionErrors.text)}
              aria-invalid={!!questionErrors.text}
              placeholder={isTrueFalse ? t('create.questionPlaceholderTrueFalse') : t('create.questionPlaceholderMultiple')}
              value={questionForm.text}
              onChange={e => changeQuestionField('text', e.target.value)}
            />
            <FieldError message={questionErrors.text && t(questionErrors.text)} />

            <label style={labelStyle}>
              {isTrueFalse ? t('create.pickCorrect') : t('create.optionsLabel')}
            </label>
            {questionForm.options.map((opt, i) => {
              const optionError = questionErrors.options?.[i]
              return (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isTrueFalse ? (
                      <div style={{ flex: 1, padding: '12px 16px', background: '#0f0f1a', borderRadius: '8px', color: 'white' }}>
                        {i === 0 ? t('create.true') : t('create.false')}
                      </div>
                    ) : (
                      <input
                        placeholder={t('create.optionPlaceholder', { number: i + 1 })}
                        value={opt}
                        onChange={e => updateOption(i, e.target.value)}
                        aria-invalid={!!optionError}
                        style={{ flex: 1, ...(optionError ? invalidStyle : {}) }}
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
                  {optionError && (
                    <p role="alert" style={{ color: '#ff4757', fontSize: '13px', marginTop: '4px' }}>{t(optionError)}</p>
                  )}
                </div>
              )
            })}

            <label style={{ ...labelStyle, marginTop: '16px' }}>{t('create.pointsLabel')}</label>
            <input
              style={inputWithError(questionErrors.points)}
              aria-invalid={!!questionErrors.points}
              inputMode="numeric"
              value={questionForm.points}
              onChange={e => changeQuestionField('points', e.target.value)}
            />
            <FieldError message={questionErrors.points && t(questionErrors.points)} />

            <button
              onClick={addQuestion}
              disabled={loading}
              style={{ background: '#6c63ff', color: 'white', width: '100%', padding: '14px', marginBottom: '10px' }}
            >
              {loading ? t('create.adding') : t('create.addQuestion')}
            </button>

            {notice && (
              <p role="status" style={{ color: '#2ecc71', fontSize: '14px' }}>{notice}</p>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginBottom: '16px' }}>{t('create.questionsAdded', { count: questions.length })}</h3>

            {questions.length === 0 && (
              <p style={{ color: '#aaa', fontStyle: 'italic', marginBottom: '8px' }}>{t('create.needQuestion')}</p>
            )}

            {questions.map((q, i) => (
              <div key={q.id} style={{ padding: '10px', background: '#0f0f1a', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <p style={{ color: '#aaa', fontSize: '12px' }}>
                    {t('create.questionNumber', { number: i + 1 })} ({q.type === 'true_false' ? t('create.typeTrueFalse') : t('create.typeMultiple')})
                  </p>
                  <button
                    onClick={() => removeQuestion(q)}
                    style={{ background: 'transparent', color: '#ff4757', border: '1px solid #ff4757', padding: '4px 10px', fontSize: '13px', minHeight: '32px' }}
                  >
                    {t('create.remove')}
                  </button>
                </div>
                <p style={{ margin: '6px 0' }}>{q.text}</p>
                {q.options.map((option, optionIndex) => (
                  <p
                    key={optionIndex}
                    style={{
                      fontSize: '14px',
                      color: optionIndex === q.correctAnswer ? '#2ecc71' : '#888',
                      fontWeight: optionIndex === q.correctAnswer ? '700' : '400'
                    }}
                  >
                    {optionIndex === q.correctAnswer ? '✓ ' : ''}{option}
                  </p>
                ))}
              </div>
            ))}

            {questions.length > 0 && (
              <button
                onClick={() => navigate(`/host/${quiz.id}`)}
                style={{ background: 'linear-gradient(135deg, #ff6584, #ff4757)', color: 'white', width: '100%', padding: '14px', marginTop: '16px' }}
              >
                {t('create.startHosting')}
              </button>
            )}

            <button
              onClick={() => navigate('/my-quizzes')}
              style={{ background: 'transparent', border: '2px solid #333', color: '#aaa', width: '100%', padding: '12px', marginTop: '12px' }}
            >
              {t('create.saveFinish')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default CreateQuiz
