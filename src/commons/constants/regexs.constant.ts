/**
 * 8–16 characters with at least one lowercase letter, one uppercase letter,
 * one number and one special character (@$!%*?&)
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
