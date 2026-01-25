const MIN_LENGTH = 9

export function validatePasswordComplexity(password: string): string | null {
  if (!password) return 'Password is required.'
  if (password.length < MIN_LENGTH) {
    return `Password must be at least ${MIN_LENGTH} characters.`
  }
  return null
}
