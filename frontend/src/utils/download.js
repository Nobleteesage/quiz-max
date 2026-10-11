import api from './api'

export async function downloadCsv(sessionId) {
  try {
    const res = await api.get(`/quiz/history/${sessionId}/csv`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(res.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `quiz-results-${sessionId.slice(0, 8)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    alert('Could not download the results. Please log in again and retry.')
  }
}
