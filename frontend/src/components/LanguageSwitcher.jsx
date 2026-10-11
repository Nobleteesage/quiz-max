import { useLanguage } from '../i18n/LanguageContext'

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  const buttonStyle = (active) => ({
    background: active ? '#6c63ff' : 'transparent',
    color: active ? 'white' : '#aaa',
    border: '1px solid #333',
    padding: '6px 12px',
    fontSize: '13px',
    minHeight: '40px'
  })

  return (
    <div style={{
      position: 'fixed',
      top: '12px',
      right: '12px',
      display: 'flex',
      gap: '6px',
      zIndex: 10
    }}>
      <button onClick={() => setLang('en')} style={buttonStyle(lang === 'en')} aria-pressed={lang === 'en'}>
        EN
      </button>
      <button onClick={() => setLang('ru')} style={buttonStyle(lang === 'ru')} aria-pressed={lang === 'ru'}>
        RU
      </button>
    </div>
  )
}

export default LanguageSwitcher
