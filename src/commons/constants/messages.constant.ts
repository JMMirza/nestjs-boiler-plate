/**
 * @readonly
 * @type {Object}
 * Shared messages for exceptions thrown out of the box by Nest
 */
export const Messages = {
  SERVER_ERROR: 'Something bad happened. Please try again later.',
  TOKEN_EXPIRED:
    'Your token is malformed or expired, please login to obtain a new one',
  INVALID_REQUEST: 'Invalid request.',
  NOT_FOUND: "Record doesn't exist",
  INVALID_CREDENTIAL:
    'Sign In Failed. Please check your credentials and try again.',
  DUPLICATE_RECORD: 'This record already exist.',
  PASSWORD_UPDATED: 'Password updated successfully.',
  ROLE: {
    ALREADY_EXISTS: 'Role with this name already exists.',
    NOT_FOUND: 'Role not found',
  },
  USER: {
    ALREADY_VERIFIED: 'User already verified',
    ALREADY_EXISTS: 'User with this email already exists.',
    DOES_NOT_EXIST: 'User does not exist.',
    UNVERIFIED: 'User is unverified',
  },
};
