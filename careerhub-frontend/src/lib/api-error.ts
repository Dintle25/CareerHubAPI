// Typed error foundation for all API calls.
// Every authenticated API call throws an ApiError, never a plain Error.
// This lets components check the specific error type and respond correctly.

// All possible error codes the app can encounter
export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class ApiError extends Error {
  // HTTP status code from the response
  readonly status: number;
  // Mapped error code for easy switching
  readonly code: ApiErrorCode;
  // Field-level errors from 422 responses e.g. { coverLetter: ["Too short"] }
  readonly fields: Record<string, string[]> | undefined;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode,
    fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  // Session expired — redirect to login, do not retry
  get isUnauthorized() {
    return this.code === "UNAUTHORIZED";
  }

  // Wrong role — redirect, do not retry
  get isForbidden() {
    return this.code === "FORBIDDEN";
  }

  // Has field-level errors — map back to form fields
  get isValidation() {
    return this.code === "VALIDATION";
  }
}

// Reads an RFC 7807 Problem Details response body and constructs an ApiError.
// The try/catch around res.json() handles responses with no body.
export async function parseApiError(res: Response): Promise<ApiError> {
  let message = `Request failed: ${res.status} ${res.statusText}`;
  let fields: Record<string, string[]> | undefined;

  try {
    const problem = await res.json();
    // Use the detail or title from the Problem Details body if available
    if (problem.detail) message = problem.detail;
    else if (problem.title) message = problem.title;

    // 422 responses include field-level errors under problem.errors
    if (problem.errors) {
      fields = problem.errors as Record<string, string[]>;
    }
  } catch {
    // No body or invalid JSON — use the default message above
  }

  // Map HTTP status to a typed error code
  let code: ApiErrorCode;
  if (res.status === 401) code = "UNAUTHORIZED";
  else if (res.status === 403) code = "FORBIDDEN";
  else if (res.status === 404) code = "NOT_FOUND";
  else if (res.status === 409) code = "CONFLICT";
  else if (res.status === 422) code = "VALIDATION";
  else if (res.status >= 500) code = "SERVER_ERROR";
  else code = "UNKNOWN";

  return new ApiError(message, res.status, code, fields);
}