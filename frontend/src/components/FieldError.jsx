// A short red message shown right under the field that has a problem.
function FieldError({ message }) {
  if (!message) return null
  return (
    <p role="alert" style={{ color: '#ff4757', fontSize: '13px', margin: '-10px 0 14px' }}>
      {message}
    </p>
  )
}

export default FieldError
