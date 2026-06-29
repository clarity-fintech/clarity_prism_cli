import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import StatusBar from "./StatusBar";
import AccountSection from "./AccountSection";
import InvestorWalkthrough from "./InvestorWalkthrough";
import {
  resolveAccessState,
  type AccessState,
  type EntitlementSnapshot,
} from "../lib/access-gate";
import { loadSettings, type BrowserAccountProfile } from "../lib/prism-bridge";
import { versionLabel } from "../lib/version";

const EMPTY_ENTITLEMENTS: EntitlementSnapshot = {
  investor: false,
  mastermindPack: false,
  partnerApproved: false,
  investorClass: null,
  partnerStatus: "none",
  packVerified: false,
};

interface AccountGateProps {
  access: AccessState;
  onEntitled: () => void;
}

export default function AccountGate({ access, onEntitled }: AccountGateProps) {
  const [profile, setProfile] = useState<BrowserAccountProfile | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementSnapshot>(EMPTY_ENTITLEMENTS);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const refresh = useCallback(async () => {
    const resolution = await resolveAccessState();
    setProfile(resolution.profile);
    setEntitlements(resolution.entitlements);
    if (resolution.state === "entitled" || resolution.state === "admin" || resolution.state === "public_launch") {
      onEntitled();
    }
  }, [onEntitled]);

  useEffect(() => {
    void resolveAccessState().then((r) => {
      setProfile(r.profile);
      setEntitlements(r.entitlements);
    });
  }, []);

  const accessLabel =
    access === "blocked"
      ? "blocked — create account"
      : access === "account_created"
        ? "account — awaiting entitlement"
        : access;

  return (
    <div className="terminal account-gate">
      <Header />
      <div className="account-gate-banner">
        <span className="account-gate-badge">ACCESS GATE</span>
        <span className="account-gate-version">{versionLabel()}</span>
        <span className="account-gate-api">{loadSettings().apiUrl || "no API"}</span>
      </div>

      {!showWalkthrough ? (
        <AccountSection
          profile={profile}
          entitlements={entitlements}
          onAccountCreated={(p) => {
            setProfile(p);
            void refresh();
          }}
          onEntitled={() => void refresh().then(onEntitled)}
          onShowWalkthrough={() => setShowWalkthrough(true)}
        />
      ) : (
        <InvestorWalkthrough
          skipAccountStep
          packVerified={entitlements.packVerified || profile?.packVerified || false}
          tier={profile?.tierInterest ?? "seed"}
          onComplete={() => {
            setShowWalkthrough(false);
            void refresh();
          }}
          onBack={() => setShowWalkthrough(false)}
        />
      )}

      <StatusBar
        funnelLabel={`Account Gate · ${accessLabel}`}
        contextLeft={100}
        queuePending={0}
        queueRunning={false}
      />
    </div>
  );
}
