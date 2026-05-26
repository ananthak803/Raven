import { ApiError } from "../utils/ApiError.js";
import { config } from "../config/index.js";

export const errorMiddleware = (err, req, res, next) => {
  const requestId = req?.id;

  // Normalize known errors
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (typeof err?.message === "string" && err?.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Avoid leaking stack traces in production
  if (config.NODE_ENV !== "production") {
    console.error("[error]", { requestId, statusCode, message, err });
  } else {
    console.error("[error]", { requestId, statusCode, message });
  }

  res.status(statusCode).json({
    success: false,
    message,
    code: statusCode,
    ...(config.NODE_ENV !== "production" && requestId ? { requestId } : {}),
  });
};

