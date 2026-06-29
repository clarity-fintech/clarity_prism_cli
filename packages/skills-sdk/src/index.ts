import { appendEvent } from "@clrt/prism-core";
import {
  requestPartnerAccess,
  getPartnerAccessStatus,
  type PartnerAccessRequest,
  type PartnerAccessResult,
  type PartnerAccessStatus,
} from "./partner-access.js";

export interface SkillContext {
  capital?: number;
  maxExposure?: number;
  [key: string]: unknown;
}

export interface SkillResult {
  skill: string;
  status: "ok" | "blocked" | "error";
  output: Record<string, unknown>;
}

export type SkillHandler = (ctx: SkillContext) => Promise<SkillResult>;

const handlers: Record<string, SkillHandler> = {
  "market-arbitrage-skill": async (ctx) => ({
    skill: "market-arbitrage-skill",
    status: "ok",
    output: {
      opportunities: 3,
      capital: ctx.capital ?? 1000,
      max_exposure: ctx.maxExposure ?? 0.2,
      best_spread_bps: 42,
    },
  }),
  "trend-momentum-skill": async (ctx) => ({
    skill: "trend-momentum-skill",
    status: "ok",
    output: { signal: "bullish", strength: 0.72, capital: ctx.capital },
  }),
  "payment-executor-skill": async (ctx) => ({
    skill: "payment-executor-skill",
    status: "ok",
    output: { queued: 1, amount: ctx.capital ?? 100, rail: "helix_internal" },
  }),
  "risk-manager-skill": async (ctx) => ({
    skill: "risk-manager-skill",
    status: "ok",
    output: {
      risk_score: 0.28,
      max_exposure: ctx.maxExposure ?? 0.2,
      within_limits: true,
    },
  }),
  "partner-access-skill": async (ctx) => {
    const entity = String(ctx.entity ?? "unknown");
    const result = await requestPartnerAccess({
      entity,
      email: ctx.email as string | undefined,
      tier: ctx.tier as string | undefined,
      correlationId: ctx.correlationId as string | undefined,
    });
    return {
      skill: "partner-access-skill",
      status: "ok",
      output: result as unknown as Record<string, unknown>,
    };
  },
};

let activeLock: string | null = null;
const installed = new Set<string>(Object.keys(handlers));

export class SkillAgent {
  install(name: string): boolean {
    const id = normalizeSkill(name);
    if (!handlers[id]) return false;
    installed.add(id);
    return true;
  }

  isInstalled(name: string): boolean {
    return installed.has(normalizeSkill(name));
  }

  locks(): { active: string | null; installed: string[] } {
    return { active: activeLock, installed: [...installed] };
  }

  async use(name: string, ctx: SkillContext = {}): Promise<SkillResult> {
    const id = normalizeSkill(name);
    if (!installed.has(id)) {
      return { skill: id, status: "error", output: { error: "skill not installed" } };
    }
    if (activeLock && activeLock !== id) {
      return {
        skill: id,
        status: "blocked",
        output: { error: `lock held by ${activeLock}` },
      };
    }
    activeLock = id;
    try {
      const handler = handlers[id]!;
      const result = await handler(ctx);
      appendEvent({ type: "skill", intent: id, evidence: result.output });
      return result;
    } finally {
      activeLock = null;
    }
  }
}

function normalizeSkill(name: string): string {
  if (name.endsWith("-skill")) return name;
  return `${name}-skill`;
}

/** Alias map for CLI short names */
export function resolveSkillName(short: string): string {
  const map: Record<string, string> = {
    "market-arbitrage": "market-arbitrage-skill",
    "trend-momentum": "trend-momentum-skill",
    "payment-executor": "payment-executor-skill",
    "risk-manager": "risk-manager-skill",
    "partner-access": "partner-access-skill",
  };
  return map[short] ?? short;
}

export const BUILTIN_SKILLS = Object.keys(handlers);

export {
  requestPartnerAccess,
  getPartnerAccessStatus,
  type PartnerAccessRequest,
  type PartnerAccessResult,
  type PartnerAccessStatus,
} from "./partner-access.js";

export {
  runQuantumSkill,
  listQuantumSkills,
  QUANTUM_SKILLS,
  type QuantumSkillMeta,
} from "./quantum-skills.js";
