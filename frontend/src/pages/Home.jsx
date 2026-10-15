import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
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

      <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '50px', textAlign: 'center' }}>
        {t('home.tagline')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '360px' }}>
        <button
          onClick={() => navigate('/create')}
          style={{ background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: 'white', padding: '16px', fontSize: '18px' }}
        >
          {t('home.create')}
        </button>

        <button
          onClick={() => navigate('/my-quizzes')}
          style={{ background: 'transparent', border: '2px solid #6c63ff', color: 'white', padding: '14px', fontSize: '16px' }}
        >
          {t('home.myQuizzes')}
        </button>

        <button
          onClick={() => navigate('/join')}
          style={{ background: 'linear-gradient(135deg, #ff6584, #ff4757)', color: 'white', padding: '16px', fontSize: '18px' }}
        >
          {t('home.join')}
        </button>

        <button
          onClick={() => navigate('/history')}
          style={{ background: 'transparent', border: '2px solid #333', color: '#aaa', padding: '14px', fontSize: '16px' }}
        >
          {t('home.history')}
        </button>
      </div>

      <p style={{ marginTop: '40px', color: '#555', fontSize: '0.9rem' }}>
        {t('home.footer')}
      </p>
    </div>
  )
}

export default Home
