import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px'
      }}>
        Quiz MAX
      </h1>

      <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '50px' }}>
        Create and host interactive quizzes in real time
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '360px' }}>
        <button
          onClick={() => navigate('/create')}
          style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: 'white', padding: '16px', fontSize: '18px' }}
        >
          Create a Quiz
        </button>

        <button
          onClick={() => navigate('/join')}
          style={{ background: 'linear-gradient(135deg, #ff6584, #ff4757)', color: 'white', padding: '16px', fontSize: '18px' }}
        >
          Join a Quiz
        </button>
      </div>

      <p style={{ marginTop: '40px', color: '#555', fontSize: '0.9rem' }}>
        Built for MAX Messenger
      </p>
    </div>
  )
}

export default Home