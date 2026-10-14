// Mirrors the old GlobalExceptionHandler: known AppErrors keep their status
// code + message, anything unexpected becomes a 500 with a generic message
// (so stack traces / internals never leak to the client).
function errorHandler(err, req, res, next) {
  // Normalize common Mongoose errors into clean, operational 400s instead of
  // letting them fall through as opaque 500s.
  if (err.name === 'CastError') {
    err = { isOperational: true, statusCode: 400, message: 'Invalid id format' };
  } else if (err.name === 'ValidationError' && err.errors) {
    err = { isOperational: true, statusCode: 400, message: Object.values(err.errors).map((e) => e.message).join(', ') };
  } else if (err.code === 11000) {
    err = { isOperational: true, statusCode: 400, message: 'A record with that value already exists' };
  }

  const statusCode = err.isOperational ? err.statusCode : 500;
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again.';

  if (!err.isOperational) {
    console.error('[unexpected error]', err);
  }

  res.status(statusCode).json({ message, ...(err.details ? { details: err.details } : {}) });
}

module.exports = errorHandler;
