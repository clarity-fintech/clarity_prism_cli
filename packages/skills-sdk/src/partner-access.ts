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

export async function requestPartnerAccess(
  req: PartnerAccessRequest
): Promise<PartnerAccessResult> {
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
