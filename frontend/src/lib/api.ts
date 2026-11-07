export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
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
    throw new ApiError(json?.message ?? "Something went wrong. Try again.", res.status, json?.errors);
  }

  // Backend shape is { success, data } so return just the data part
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Backend wraps results like { user }, { profile }, { campaign }. Take the inner value if it's there. */
export function pick<T>(data: unknown, key: string): T {
  if (data && typeof data === "object" && key in data) {
    return (data as Record<string, T>)[key];
  }
  return data as T;
}