export async function fetchJson<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(input, { credentials: "include", ...init });
  const text = await res.text();
  let data: T;
  try {
    data = (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error(
      res.ok
        ? "Server returned invalid JSON"
        : `Request failed (${res.status})`
    );
  }
  return { ok: res.ok, status: res.status, data };
}
