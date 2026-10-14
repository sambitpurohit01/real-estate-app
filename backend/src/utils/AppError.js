// A simple operational error class. Controllers/services throw these and the
// global error handler turns them into the right HTTP response.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = AppError;
