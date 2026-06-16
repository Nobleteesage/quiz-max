import { useLocation, useNavigate } from 'react-router-dom'

function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { results, myName } = location.state || {}

  if (!results) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <p style={{ color: '#aaa' }}>No results found.</p>
        <button
          onClick={() => navigate('/')}
          style={{ marginTop: '20px', background: '#6c63ff', color: 'white' }}
        >
          Go Home
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
          Quiz Finished!
        </h1>
        <p style={{ color: '#555', marginTop: '8px' }}>Final Leaderboard</p>
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
                      YOU
                    </span>
                  )}
                </div>
                <p style={{ color: '#555', fontSize: '13px', marginTop: '2px' }}>
                  Time: {participant.timeTaken}
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
                <p style={{ color: '#555', fontSize: '12px' }}>points</p>
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
        Back to Home
      </button>
    </div>
  )
}

export default Results