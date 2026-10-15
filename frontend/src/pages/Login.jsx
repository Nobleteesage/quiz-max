import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { setToken } from '../utils/auth'
import { useLanguage } from '../i18n/LanguageContext'
import { serverError } from '../i18n/serverErrors'
import FieldError from '../components/FieldError'
import { validateLogin, hasErrors } from '../utils/validate.mjs'
import { focusFirstError, invalidStyle } from '../utils/focusError'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const goAfterLogin = location.state?.from || '/my-quizzes'
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Once every highlighted field is fixed, the summary at the top goes away too
  useEffect(() => {
    if (error === t('common.fixFields') && !hasErrors(fieldErrors)) {
      setError('')
    }
  }, [fieldErrors, error, t])

  const containerStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '64px 20px 40px'
  }

  const cardStyle = {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: 'clamp(18px, 5vw, 30px)'
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

  const submit = async () => {
    const problems = validateLogin({ username, password })
    if (hasErrors(problems)) {
      setFieldErrors(problems)
      setError(t('common.fixFields'))
      focusFirstError()
      return
    }
    setFieldErrors({})
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const res = await axios.post(endpoint, { username, password })
      setToken(res.data.token)
      navigate(goAfterLogin)
    } catch (err) {
      setError(serverError(t, err.response?.data?.error) || t('login.errorGeneric'))
    }
    setLoading(false)
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>
        {mode === 'login' ? t('login.titleLogin') : t('login.titleRegister')}
      </h2>

      {error && (
        <div style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {error}
        </div>
      )}

      <div style={cardStyle}>
        <label style={labelStyle}>{t('login.username')}</label>
        <input
          style={{ ...inputStyle, ...(fieldErrors.username ? invalidStyle : {}) }}
          aria-invalid={!!fieldErrors.username}
          value={username}
          onChange={e => {
            setUsername(e.target.value)
            setFieldErrors({ ...fieldErrors, username: '' })
          }}
        />
        <FieldError message={fieldErrors.username && t(fieldErrors.username)} />

        <label style={labelStyle}>{t('login.password')}</label>
        <input
          style={{ ...inputStyle, ...(fieldErrors.password ? invalidStyle : {}) }}
          aria-invalid={!!fieldErrors.password}
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value)
            setFieldErrors({ ...fieldErrors, password: '' })
          }}
        />
        <FieldError message={fieldErrors.password && t(fieldErrors.password)} />

        <button
          onClick={submit}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: 'white', width: '100%', padding: '14px', marginBottom: '12px' }}
        >
          {loading ? t('login.wait') : mode === 'login' ? t('login.submitLogin') : t('login.submitRegister')}
        </button>

        <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center' }}>
          {mode === 'login' ? t('login.noAccount') : t('login.haveAccount')}{' '}
          <span
            style={{ color: '#6c63ff', cursor: 'pointer' }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? t('login.switchToRegister') : t('login.switchToLogin')}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
