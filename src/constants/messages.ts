export const MESSAGES = {
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  AUTH_ERROR: 'Invalid email or password',
  VERIFICATION_SUCCESS: 'Your email has been verified. You can now sign in.',
  VERIFICATION_INVALID: 'This verification link is invalid or has expired',
  RESET_SUCCESS: 'Your password has been successfully reset. You can now sign in.',
  RESET_INVALID: 'This reset link is invalid or has expired',
  FORGOT_SUCCESS: 'If this email is registered, you will receive a reset link',
  RATE_LIMIT_ERROR: 'Too many attempts. Please try again later.',
  UNAUTHORIZED: 'Unauthorized',
} as const
