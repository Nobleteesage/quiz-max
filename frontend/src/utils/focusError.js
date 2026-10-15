// After a failed check, bring the first field with a problem into view and put the cursor in it.
export function focusFirstError() {
  setTimeout(() => {
    const field = document.querySelector('[aria-invalid="true"]')
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' })
      field.focus({ preventScroll: true })
    }
  }, 50)
}

// The red border that marks a field with a problem
export const invalidStyle = { borderColor: '#ff4757' }
