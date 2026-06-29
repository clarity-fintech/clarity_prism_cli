export interface PartnerAccessRequest {
  entity: string;
  email?: string;
  tier?: string;
  correlationId?: string;
}

export interface PartnerAccessResult {
  requestId: string;
  entity: string;
  tier: string;
  status: "pending" | "approved" | "review";
  submittedAt: string;
}

export interface PartnerAccessStatus {
  correlationId?: string;
  status: "none" | "pending" | "approved" | "review";
  tier?: string;
  updatedAt: string;
}

const pending = new Map<string, PartnerAccessResult>();

function apiBase(): string | null {
  const url = process.env.CLRTY_API_URL;
  return url ? url.replace(/\/$/, "") : null;
}

export async function requestPartnerAccess(
  req: PartnerAccessRequest
): Promise<PartnerAccessResult> {
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
        const body = (await res.json()) as PartnerAccessResult & { request_id?: string };
        return {
          requestId: body.requestId ?? body.request_id ?? `PAR-${Date.now().toString(36).toUpperCase()}`,
          entity: body.entity ?? req.entity,
          tier: body.tier ?? req.tier ?? "seed",
          status: body.status ?? "pending",
          submittedAt: body.submittedAt ?? new Date().toISOString(),
        };
      }
    } catch {
      /* fall through to local */
    }
  }

  const requestId = `PAR-${Date.now().toString(36).toUpperCase()}`;
  const result: PartnerAccessResult = {
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

export async function getPartnerAccessStatus(
  correlationId?: string
): Promise<PartnerAccessStatus> {
  if (!correlationId) {
    return { status: "none", updatedAt: new Date().toISOString() };
  }

  const base = apiBase();
  if (base) {
    try {
      const res = await fetch(
        `${base}/v1/partner/status?correlation_id=${encodeURIComponent(correlationId)}`
      );
      if (res.ok) {
        const body = (await res.json()) as PartnerAccessStatus;
        return {
          correlationId,
          status: body.status ?? "none",
          tier: body.tier,
          updatedAt: body.updatedAt ?? new Date().toISOString(),
        };
      }
    } catch {
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
