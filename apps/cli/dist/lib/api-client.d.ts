export interface ApiFetchOptions extends RequestInit {
    json?: unknown;
}
export declare function getApiBaseUrl(): string;
export declare function apiFetch<T = unknown>(baseUrl: string, path: string, options?: ApiFetchOptions): Promise<T | null>;
//# sourceMappingURL=api-client.d.ts.map