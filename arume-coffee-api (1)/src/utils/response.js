/**
 * Standardized Response Helpers for Arume Coffee API
 * Standard Success: { success: true, message: "...", data: {} }
 * Standard Error:   { success: false, message: "...", error: "..." }
 */

export const successResponse = (c, message, data = {}, status = 200) => {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    status
  );
};

export const errorResponse = (c, message, error = null, status = 400) => {
  return c.json(
    {
      success: false,
      message,
      error: error || message,
    },
    status
  );
};
