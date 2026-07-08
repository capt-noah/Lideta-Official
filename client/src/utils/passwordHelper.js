/**
 * Checks if a password is strong based on standard criteria:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function validatePasswordStrength(password) {
  if (!password) return { isValid: false, score: 0, feedback: 'Password is required.' }

  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  }

  const passedChecksCount = Object.values(checks).filter(Boolean).length

  let feedback = []
  if (!checks.length) feedback.push('at least 8 characters long')
  if (!checks.hasUpper) feedback.push('an uppercase letter')
  if (!checks.hasLower) feedback.push('a lowercase letter')
  if (!checks.hasDigit) feedback.push('a digit')
  if (!checks.hasSpecial) feedback.push('a special character')

  return {
    isValid: passedChecksCount === 5,
    score: passedChecksCount, // Out of 5
    feedback: feedback.length > 0 ? `Must contain: ${feedback.join(', ')}.` : ''
  }
}

/**
 * Generates a strong random password similar to Google's suggestion style:
 * - Length between 12 and 16 characters
 * - Mix of uppercase, lowercase, numbers, and symbols
 * - Avoids ambiguous characters like O, 0, I, l
 */
export function generateStrongPassword() {
  const lowercase = 'abcdefghijkmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'
  const numbers = '123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = lowercase + uppercase + numbers + symbols

  // Ensure at least one of each required group is present
  let password = ''
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill up to 14 characters
  for (let i = 0; i < 10; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password characters to avoid predictable patterns
  return password.split('').sort(() => 0.5 - Math.random()).join('')
}
