import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function CreateQuiz() {
  const navigate = useNavigate()
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

  const [questionForm, setQuestionForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 10
  })

  const [questions, setQuestions] = useState([])

  const createQuiz = async () => {
    if (!quizForm.title) {
      setError('Please enter a quiz title')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/quiz/create', quizForm)
      setQuiz(res.data.quiz)
      setStep(2)
    } catch (err) {
      setError('Failed to create quiz. Is the server running?')
    }
    setLoading(false)
  }

  const addQuestion = async () => {
    if (!questionForm.text) {
      setError('Please enter a question')
      return
    }
    if (questionForm.options.some(o => !o)) {
      setError('Please fill in all answer options')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`/api/quiz/${quiz.id}/question`, questionForm)
      setQuestions([...questions, res.data.question])
      setQuestionForm({ text: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 })
    } catch (err) {
      setError('Failed to add question')
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
    padding: '40px 20px'
  }

  const cardStyle = {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: '30px',
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

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>
        {step === 1 ? 'Create a New Quiz' : 'Add Questions'}
      </h2>

      {error && (
        <div style={{ background: '#ff475720', border: '1px solid #ff4757', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff4757' }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div style={cardStyle}>
          <label style={labelStyle}>Quiz Title *</label>
          <input
            style={inputStyle}
            placeholder="e.g. General Knowledge Quiz"
            value={quizForm.title}
            onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
          />

          <label style={labelStyle}>Description</label>
          <input
            style={inputStyle}
            placeholder="Optional description"
            value={quizForm.description}
            onChange={e => setQuizForm({ ...quizForm, description: e.target.value })}
          />

          <label style={labelStyle}>Time per Question (seconds)</label>
          <input
            style={inputStyle}
            type="number"
            min="5"
            max="120"
            value={quizForm.timeLimit}
            onChange={e => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
          />

          <label style={labelStyle}>Penalty Points for Wrong Answer</label>
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
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      )}

      {step === 2 && quiz && (
        <>
          <div style={{ ...cardStyle, borderLeft: '4px solid #6c63ff' }}>
            <p style={{ color: '#6c63ff', fontWeight: '700', fontSize: '1.1rem' }}>Quiz Created!</p>
            <p style={{ color: '#aaa', marginTop: '4px' }}>Join Code: <span style={{ color: 'white', fontWeight: '700', fontSize: '1.4rem' }}>{quiz.joinCode}</span></p>
            <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '4px' }}>Share this code with participants</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginBottom: '20px' }}>Add a Question</h3>

            <label style={labelStyle}>Question Text *</label>
            <input
              style={inputStyle}
              placeholder="e.g. What is the capital of France?"
              value={questionForm.text}
              onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })}
            />

            <label style={labelStyle}>Answer Options *</label>
            {questionForm.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="radio"
                  name="correct"
                  checked={questionForm.correctAnswer === i}
                  onChange={() => setQuestionForm({ ...questionForm, correctAnswer: i })}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ color: '#aaa', fontSize: '12px' }}>Correct</span>
              </div>
            ))}

            <label style={labelStyle}>Points for this Question</label>
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
              {loading ? 'Adding...' : 'Add Question'}
            </button>
          </div>

          {questions.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ marginBottom: '16px' }}>Questions Added ({questions.length})</h3>
              {questions.map((q, i) => (
                <div key={q.id} style={{ padding: '10px', background: '#0f0f1a', borderRadius: '8px', marginBottom: '8px' }}>
                  <p style={{ color: '#aaa', fontSize: '12px' }}>Q{i + 1}</p>
                  <p>{q.text}</p>
                </div>
              ))}

              <button
                onClick={() => navigate(`/host/${quiz.id}`)}
                style={{ background: 'linear-gradient(135deg, #ff6584, #ff4757)', color: 'white', width: '100%', padding: '14px', marginTop: '16px' }}
              >
                Start Hosting This Quiz
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CreateQuiz