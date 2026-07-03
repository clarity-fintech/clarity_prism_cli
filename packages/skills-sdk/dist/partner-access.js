const pending = new Map();
function apiBase() {
    const url = process.env.CLRTY_API_URL;
    return url ? url.replace(/\/$/, "") : null;
}
export async function requestPartnerAccess(req) {
    const base = apiBase();
    if (base) {
        try {
            const res = await fetch(`${base}/v1/partner/request-access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entity: req.entity,
                    email: req.email,
                    tier: req.tier ?? "seed",
                    correlation_id: req.correlationId,
                }),
            });
            if (res.ok) {
                const body = (await res.json());
                return {
                    requestId: body.requestId ?? body.request_id ?? `PAR-${Date.now().toString(36).toUpperCase()}`,
                    entity: body.entity ?? req.entity,
                    tier: body.tier ?? req.tier ?? "seed",
                    status: body.status ?? "pending",
                    submittedAt: body.submittedAt ?? new Date().toISOString(),
                };
            }
        }
        catch {
            /* fall through to local */
        }
    }
    const requestId = `PAR-${Date.now().toString(36).toUpperCase()}`;
    const result = {
        requestId,
        entity: req.entity,
        tier: req.tier ?? "seed",
        status: "pending",
        submittedAt: new Date().toISOString(),
    };
    if (req.correlationId) {
        pending.set(req.correlationId, result);
    }
    return result;
}
export async function getPartnerAccessStatus(correlationId) {
    if (!correlationId) {
        return { status: "none", updatedAt: new Date().toISOString() };
    }
    const base = apiBase();
    if (base) {
        try {
            const res = await fetch(`${base}/v1/partner/status?correlation_id=${encodeURIComponent(correlationId)}`);
            if (res.ok) {
                const body = (await res.json());
                return {
                    correlationId,
                    status: body.status ?? "none",
                    tier: body.tier,
                    updatedAt: body.updatedAt ?? new Date().toISOString(),
                };
            }
        }
        catch {
            /* fall through */
        }
    }
    const entry = pending.get(correlationId);
    if (!entry) {
        return { correlationId, status: "none", updatedAt: new Date().toISOString() };
    }
    return {
        correlationId,
        status: entry.status,
        tier: entry.tier,
        updatedAt: entry.submittedAt,
    };
}
//# sourceMappingURL=partner-access.js.map