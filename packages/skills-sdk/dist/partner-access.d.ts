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
export declare function requestPartnerAccess(req: PartnerAccessRequest): Promise<PartnerAccessResult>;
export declare function getPartnerAccessStatus(correlationId?: string): Promise<PartnerAccessStatus>;
//# sourceMappingURL=partner-access.d.ts.map