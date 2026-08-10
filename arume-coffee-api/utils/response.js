/**
 * Standard Success Response Format
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": {}
 * }
 */
export const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard Error Response Format
 * {
 *   "success": false,
 *   "message": "...",
 *   "error": "..."
 * }
 */
export const errorResponse = (res, message, error = null, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || message,
  });
};
