import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setToken } from '../utils/auth'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const containerStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 20px'
  }

  const cardStyle = {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: '30px'
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
    if (!username || !password) {
      setError('Please enter a username and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const res = await axios.post(endpoint, { username, password })
      setToken(res.data.token)
      navigate('/create')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>
        {mode === 'login' ? 'Host Login' : 'Create Host Account'}
      </h2>

      {error && (
        <div style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {error}
        </div>
      )}

      <div style={cardStyle}>
        <label style={labelStyle}>Username</label>
        <input
          style={inputStyle}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label style={labelStyle}>Password</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: 'white', width: '100%', padding: '14px', marginBottom: '12px' }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Register'}
        </button>

        <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={{ color: '#6c63ff', cursor: 'pointer' }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Register' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
