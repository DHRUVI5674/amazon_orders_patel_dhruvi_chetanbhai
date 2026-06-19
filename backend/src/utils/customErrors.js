// utils/customErrors.js

/**
 * Custom error classes for the application.
 * Currently only ValidationError is used by the global error handler.
 */
export class ValidationError extends Error {
  /**
   * @param {string} message - Human‑readable error message
   * @param {any} [details=null] - Optional extra information (e.g., validation failures)
   * @param {number} [status=400] - HTTP status code to return (default 400)
   */
  constructor(message, details = null, status = 400) {
    super(message);
    this.name = "ValidationError";
    this.status = status;
    this.details = details;
  }
}
