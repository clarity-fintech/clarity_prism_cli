export function getApiBaseUrl() {
    return process.env.CLRTY_API_URL ?? "http://127.0.0.1:8545";
}
export async function apiFetch(baseUrl, path, options = {}) {
    const url = `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = {
        Accept: "application/json",
        ...options.headers,
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
            return (await res.json());
        }
        return (await res.text());
    }
    catch (err) {
        if (process.env.CLRTY_API_STRICT === "1")
            throw err;
        return null;
    }
}
//# sourceMappingURL=api-client.js.map