const AppError = require('../utils/AppError');

// Wraps a Zod schema into Express middleware. Validates + replaces req.body
// with the parsed (and type-coerced) result, so controllers can trust it.
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      const err = new AppError('Invalid request data', 400);
      err.details = details;
      return next(err);
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
