import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./Header";
import StatusBar from "./StatusBar";
import AccountSection from "./AccountSection";
import AdminLoginSection from "./AdminLoginSection";
import GateScrollNav from "./GateScrollNav";
import PrismLogo from "./PrismLogo";
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    const resolution = await resolveAccessState();
    setProfile(resolution.profile);
    setEntitlements(resolution.entitlements);
    if (resolution.state === "entitled" || resolution.state === "admin" || resolution.state === "personal" || resolution.state === "public_launch") {
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
    <div className="terminal account-gate theme-bw">
      <Header />
      <div className="account-gate-logo-row">
        <PrismLogo variant="bw" size={72} compact showWord />
      </div>
      <div className="account-gate-banner">
        <span className="account-gate-badge">ACCESS GATE</span>
        <span className="account-gate-version">{versionLabel()}</span>
        <span className="account-gate-api">{loadSettings().apiUrl || "no API"}</span>
      </div>

      {!showWalkthrough ? (
        <div className="gate-layout">
          <GateScrollNav scrollRootRef={scrollRef} />
          <div className="gate-scroll-body" ref={scrollRef}>
            <section id="gate-operator" className="gate-scroll-section">
              <AdminLoginSection onEntitled={() => void refresh().then(onEntitled)} />
            </section>
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
          </div>
        </div>
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
