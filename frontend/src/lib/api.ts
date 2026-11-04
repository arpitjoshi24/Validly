export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, { body, headers, ...rest }: Options = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include", // sends the HTTP-only JWT cookie
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...rest,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Adjust to whatever shape errorHandler.js returns
    throw new ApiError(json?.message ?? "Something went wrong. Try again.", res.status, json?.errors);
  }

  // Works whether the backend returns { data: ... } or the raw object
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};