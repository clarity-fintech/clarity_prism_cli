export interface ApiFetchOptions extends RequestInit {
  json?: unknown;
}

export function getApiBaseUrl(): string {
  return process.env.CLRTY_API_URL ?? "http://127.0.0.1:8545";
}

export async function apiFetch<T = unknown>(
  baseUrl: string,
  path: string,
  options: ApiFetchOptions = {}
): Promise<T | null> {
  const url = `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  let body = options.body;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  try {
    const res = await fetch(url, { ...options, headers, body });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (err) {
    if (process.env.CLRTY_API_STRICT === "1") throw err;
    return null;
  }
}
