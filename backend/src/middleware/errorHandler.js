/**
 * Centralized API error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
