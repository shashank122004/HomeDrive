// Central place for turning any thrown error into a consistent JSON/HTML
// response, so controllers can just "throw" or call next(err).
export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  res.status(statusCode).json({ error: message });
}
