const AUTH_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Incorrect password",
  "auth/invalid-credential": "Invalid email or password",
  "auth/too-many-requests": "Too many attempts. Please try again later",
};

export function friendlyAuthError(error) {
  return AUTH_ERRORS[error.code] || error.message;
}
