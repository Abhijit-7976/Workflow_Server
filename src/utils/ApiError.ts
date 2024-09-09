class ApiError extends Error {
  status: "fail" | "error";
  isOperational: boolean;
  message: string;

  constructor(message: string, public statusCode: number) {
    super(message);
    this.message = message;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
