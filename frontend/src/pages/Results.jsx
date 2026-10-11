import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, tn } = useLanguage()
  const { results, myName } = location.state || {}

  // The server sends times like "30s". Show them with the unit of the chosen language.
  const formatTime = (value) => {
    const seconds = parseInt(value, 10)
    return Number.isNaN(seconds) ? value : t('quiz.secondsShort', { count: seconds })
  }

  if (!results) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh'
      }}>
        <p style={{ color: '#aaa' }}>{t('results.noResults')}</p>
        <button
          onClick={() => navigate('/')}
          style={{ marginTop: '20px', background: '#6c63ff', color: 'white' }}
        >
          {t('results.goHome')}
        </button>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏆</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t('results.title')}
        </h1>
        <p style={{ color: '#555', marginTop: '8px' }}>{t('results.subtitle')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        {results.map((participant, index) => {
          const isMe = participant.name === myName
          return (
            <div
              key={index}
              style={{
                background: isMe ? '#6c63ff20' : '#1a1a2e',
                border: isMe ? '2px solid #6c63ff' : '2px solid transparent',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <span style={{ fontSize: '2rem', minWidth: '40px' }}>
                {medals[index] || `${index + 1}`}
              </span>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{participant.name}</p>
                  {isMe && (
                    <span style={{
                      background: '#6c63ff',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>
                      {t('results.you')}
                    </span>
                  )}
                </div>
                <p style={{ color: '#555', fontSize: '13px', marginTop: '2px' }}>
                  {t('results.time', { time: formatTime(participant.timeTaken) })}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: index === 0 ? '#f39c12' : index === 1 ? '#aaa' : index === 2 ? '#cd7f32' : 'white'
                }}>
                  {participant.score}
                </p>
                <p style={{ color: '#555', fontSize: '12px' }}>{tn('results.pointsLabel', participant.score)}</p>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => navigate('/')}
        style={{
          background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
          color: 'white',
          width: '100%',
          padding: '16px',
          fontSize: '18px'
        }}
      >
        {t('common.backHome')}
      </button>
    </div>
  )
}

export default Results
