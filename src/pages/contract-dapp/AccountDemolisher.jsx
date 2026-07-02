import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Globe2,
  KeyRound,
  Layers3,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";

const i18n = {
  en: {
    title: "Account Demolisher",
    subtitle: "Protected account closure for Stellar and Soroban accounts.",
    scan: "Run protected scan",
    proceed: "Proceed to protected demolition",
    allowances: "Allowance audit",
  },
  es: {
    title: "Demolición de cuenta",
    subtitle: "Cierre protegido de cuentas Stellar y Soroban.",
    scan: "Ejecutar escaneo protegido",
    proceed: "Continuar",
    allowances: "Auditoría de permisos",
  },
  ar: {
    title: "إغلاق الحساب",
    subtitle: "إغلاق محمي لحسابات Stellar و Soroban.",
    scan: "تشغيل الفحص المحمي",
    proceed: "المتابعة",
    allowances: "فحص الصلاحيات",
  },
};

const languages = [
  { key: "en", label: "English" },
  { key: "es", label: "Spanish" },
  { key: "ar", label: "Arabic" },
  { key: "fr", label: "French" },
  { key: "pt", label: "Portuguese" },
  { key: "tr", label: "Turkish" },
  { key: "zh", label: "Chinese" },
  { key: "hi", label: "Hindi" },
  { key: "ru", label: "Russian" },
];

const account = {
  address: "GCBY4KZ4QW7QJXJH2AHY6E3Y7MSA7VZSLK4FZTYE6OVV4TQZ3DUMMY",
  network: "TESTNET",
  destination: "GDESTINATIONEXCHANGEORWALLETADDRESSDUMMY",
  nativeBalance: "18.4319221",
  estimatedRecoverableXlm: "32.9184412",
  baseReserveXlm: "1.0000000",
};

const findings = [
  {
    id: "multisig",
    label: "Multisig configuration",
    status: "warning",
    value: "2 extra signers",
    description: "Account requires signer cleanup before final merge.",
    details: [
      { label: "Master weight", value: "1" },
      { label: "Low threshold", value: "2" },
      { label: "Medium threshold", value: "2" },
      { label: "High threshold", value: "3" },
      { label: "Extra signer 1", value: "GDSIGNER1DUMMY...7KQ" },
      { label: "Extra signer 2", value: "GDSIGNER2DUMMY...92P" },
    ],
  },
  {
    id: "trustlines",
    label: "Trustlines",
    status: "warning",
    value: "5 active",
    description:
      "All non-native balances must be emptied before trustlines are removed.",
    details: [
      { label: "USDC", value: "42.91, issuer Centre.io" },
      { label: "AQUA", value: "991.21, issuer Aquarius" },
      { label: "BLND", value: "12.40, issuer Blend" },
      { label: "yXLM", value: "8.12, issuer YieldBlox" },
      { label: "EURC", value: "19.55, issuer Circle" },
    ],
  },
  {
    id: "positions",
    label: "Soroban DeFi positions",
    status: "danger",
    value: "3 positions",
    description: "Protocol-specific exits are required before account closure.",
    details: [
      { label: "Blend", value: "Supply: 120 USDC, Borrow: 15 XLM" },
      { label: "Soroswap", value: "LP: AQUA/XLM, pool share 0.43%" },
      { label: "Aquarius", value: "Voting escrow: 991 AQUA locked" },
    ],
  },
  {
    id: "claimable",
    label: "Claimable balances",
    status: "info",
    value: "4 pending",
    description: "User can select which balances to claim before demolition.",
    details: [
      { label: "CB-001", value: "10 USDC claimable now" },
      { label: "CB-002", value: "3.5 XLM claimable now" },
      { label: "CB-003", value: "100 AQUA claimable after predicate" },
      { label: "CB-004", value: "1.1 EURC claimable now" },
    ],
  },
  {
    id: "offers",
    label: "Classic DEX offers",
    status: "warning",
    value: "2 open",
    description: "Offers must be cancelled before asset conversion.",
    details: [
      { label: "Offer #82912", value: "Sell AQUA for XLM" },
      { label: "Offer #82913", value: "Sell USDC for XLM" },
    ],
  },
  {
    id: "data",
    label: "Account data entries",
    status: "warning",
    value: "3 entries",
    description: "Data entries consume reserves and must be cleared.",
    details: [
      { label: "home_domain", value: "demo.sorobuild.io" },
      { label: "kyc_status", value: "legacy_verified" },
      { label: "app_state", value: "archived" },
    ],
  },
];

const balances = [
  {
    id: "xlm",
    code: "XLM",
    balance: "18.4319221",
    route: "Keep native balance",
  },
  { id: "usdc", code: "USDC", balance: "42.91", route: "Swap to XLM" },
  { id: "aqua", code: "AQUA", balance: "991.21", route: "Swap to XLM" },
  { id: "blnd", code: "BLND", balance: "12.40", route: "Swap to XLM" },
  { id: "eurc", code: "EURC", balance: "19.55", route: "Swap to XLM" },
];

const allowances = [
  {
    id: "a1",
    protocol: "Blend",
    spender: "CBLEND...8DK",
    asset: "USDC",
    amount: "250.00",
  },
  {
    id: "a2",
    protocol: "Soroswap",
    spender: "CSWAP...9AP",
    asset: "AQUA",
    amount: "900.00",
  },
  {
    id: "a3",
    protocol: "Aquarius",
    spender: "CAQUA...2LL",
    asset: "BLND",
    amount: "50.00",
  },
];

export default function AccountDemolisher() {
  const [lang, setLang] = useState("en");
  const t = i18n[lang] || i18n.en;

  const [walletConnected, setWalletConnected] = useState(true);
  const [scanStatus, setScanStatus] = useState("idle");
  const [expandedFinding, setExpandedFinding] = useState(null);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [showAllowances, setShowAllowances] = useState(false);
  const [destination, setDestination] = useState(account.destination);
  const [selectedBalances, setSelectedBalances] = useState(
    balances.filter((x) => x.id !== "xlm").map((x) => x.id)
  );
  const [selectedAllowances, setSelectedAllowances] = useState(
    allowances.map((x) => x.id)
  );
  const [confirmPreview, setConfirmPreview] = useState(false);
  const [confirmRisk, setConfirmRisk] = useState(false);
  const [plan, setPlan] = useState(null);
  const [copied, setCopied] = useState("");

  const scanComplete = scanStatus === "complete";

  const batches = useMemo(() => {
    return [
      {
        id: "batch-1",
        title: "Cancel open offers",
        type: "Classic",
        ops: [
          "manageSellOffer: offerId 82912 amount 0",
          "manageSellOffer: offerId 82913 amount 0",
        ],
      },
      {
        id: "batch-2",
        title: "Exit Soroban DeFi positions",
        type: "Soroban",
        ops: [
          "Blend withdraw supplied USDC",
          "Soroswap remove AQUA/XLM LP",
          "Aquarius unlock/redeem AQUA position",
        ],
      },
      {
        id: "batch-3",
        title: "Claim selected balances",
        type: "Classic",
        ops: [
          "claimClaimableBalance CB-001",
          "claimClaimableBalance CB-002",
          "claimClaimableBalance CB-004",
        ],
      },
      {
        id: "batch-4",
        title: "Revoke selected allowances",
        type: "Soroban",
        ops: selectedAllowances.map((id) => `revokeAllowance: ${id}`),
      },
      {
        id: "batch-5",
        title: "Swap non-XLM balances",
        type: "Routing",
        ops: selectedBalances.map((id) => {
          const item = balances.find((x) => x.id === id);
          return `pathPaymentStrictSend: ${item?.code} → XLM`;
        }),
      },
      {
        id: "batch-6",
        title: "Remove trustlines and data entries",
        type: "Cleanup",
        ops: [
          "changeTrust USDC limit 0",
          "changeTrust AQUA limit 0",
          "changeTrust BLND limit 0",
          "manageData home_domain null",
          "manageData kyc_status null",
        ],
      },
      {
        id: "batch-7",
        title: "Remove extra signers and merge through mediator",
        type: "Final",
        ops: [
          "setOptions remove signer 1",
          "setOptions remove signer 2",
          "accountMerge mediator",
          "payment mediator → destination",
        ],
      },
    ];
  }, [selectedAllowances, selectedBalances]);

  const canProceed =
    walletConnected &&
    scanComplete &&
    destination.trim() &&
    confirmPreview &&
    confirmRisk;

  function runScan() {
    setScanStatus("scanning");
    setPlan(null);
    setTimeout(() => setScanStatus("complete"), 900);
  }

  function buildPlan() {
    if (!canProceed) return;

    setPlan({
      id: `DEMOLITION-${Date.now()}`,
      createdAt: new Date().toLocaleString(),
      destination,
      batches,
    });
  }

  async function copy(value, label) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  }

  function toggleArrayValue(setter, value) {
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%)] px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  <Trash2 size={14} />
                  {t.title}
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {t.subtitle}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Scan account blockers, inspect positions, select balances and
                  allowances, generate transaction batches, and proceed only
                  after protected confirmation.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={runScan}
                    disabled={scanStatus === "scanning"}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        scanStatus === "scanning" ? "animate-spin" : ""
                      }
                    />
                    {scanStatus === "scanning" ? "Scanning..." : t.scan}
                  </button>

                  <button
                    onClick={() => setShowAllowances((x) => !x)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    {showAllowances ? "Hide allowance audit" : t.allowances}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                <Stat label="Network" value={account.network} />
                <Stat
                  label="Wallet"
                  value={walletConnected ? "Connected" : "Disconnected"}
                />
                <Stat
                  label="Scan"
                  value={scanComplete ? "Complete" : scanStatus}
                />
                <Stat label="Languages" value="9 ready" />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Globe2 size={18} className="text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Internal language system
                  </p>
                  <p className="text-xs text-slate-500">
                    UI labels are driven by language keys.
                  </p>
                </div>
              </div>

              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-slate-900"
              >
                {languages.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-6">
            <Card
              title="Account overview"
              desc="Realistic dummy account profile."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Native XLM" value={account.nativeBalance} />
                <Metric
                  label="Recoverable XLM"
                  value={account.estimatedRecoverableXlm}
                  tone="success"
                />
                <Metric label="Base reserve" value={account.baseReserveXlm} />
                <Metric
                  label="Generated batches"
                  value={batches.length}
                  tone="info"
                />
              </div>

              <div className="mt-5 space-y-3">
                <InfoRow
                  label="Source account"
                  value={account.address}
                  onCopy={() => copy(account.address, "Source copied")}
                />
                <InfoRow
                  label="Destination"
                  value={destination}
                  onCopy={() => copy(destination, "Destination copied")}
                />
              </div>

              {copied && (
                <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {copied}
                </p>
              )}
            </Card>

            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-rose-950">
                    Protected proceed mode
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-rose-800">
                    The user cannot build the final plan until wallet, scan,
                    destination, preview confirmation, and irreversible-risk
                    confirmation are all complete.
                  </p>
                </div>
              </div>
            </section>

            <Card
              title="Dry-run findings"
              desc="Expand each blocker to view full information."
            >
              {!scanComplete ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  Run the protected scan to reveal account blockers.
                </div>
              ) : (
                <div className="space-y-3">
                  {findings.map((item) => (
                    <Finding
                      key={item.id}
                      item={item}
                      open={expandedFinding === item.id}
                      onClick={() =>
                        setExpandedFinding(
                          expandedFinding === item.id ? null : item.id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </Card>

            {showAllowances && (
              <Card
                title="Allowance audit"
                desc="Select authorizations to revoke before account closure."
              >
                <div className="space-y-3">
                  {allowances.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAllowances.includes(item.id)}
                          onChange={() =>
                            toggleArrayValue(setSelectedAllowances, item.id)
                          }
                          className="mt-1 h-4 w-4"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.protocol} allowance
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.amount} {item.asset} approved to{" "}
                            {item.spender}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                        Active
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            <Card
              title="Asset routing"
              desc="Select non-XLM balances to route before trustline removal."
            >
              <div className="space-y-3">
                {balances.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        disabled={item.id === "xlm"}
                        checked={
                          item.id === "xlm" ||
                          selectedBalances.includes(item.id)
                        }
                        onChange={() =>
                          toggleArrayValue(setSelectedBalances, item.id)
                        }
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.code}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Balance: {item.balance}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      {item.route}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            <Card
              title="Generated transaction batches"
              desc="Expand each batch to see exact dummy operations."
            >
              <div className="space-y-3">
                {batches.map((batch) => (
                  <Batch
                    key={batch.id}
                    batch={batch}
                    open={expandedBatch === batch.id}
                    onClick={() =>
                      setExpandedBatch(
                        expandedBatch === batch.id ? null : batch.id
                      )
                    }
                  />
                ))}
              </div>
            </Card>

            <Card
              title="Final protected proceed"
              desc="Destination and confirmations are required."
            >
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Destination wallet or exchange address
              </label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />

              <div className="mt-5 space-y-3">
                <Confirm checked={confirmPreview} onChange={setConfirmPreview}>
                  I reviewed the scan, balances, allowances, DeFi positions, and
                  generated batches.
                </Confirm>

                <Confirm checked={confirmRisk} onChange={setConfirmRisk}>
                  I understand account merge and signer cleanup are
                  irreversible.
                </Confirm>
              </div>

              <button
                onClick={buildPlan}
                disabled={!canProceed}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {t.proceed}
              </button>

              {!walletConnected && (
                <Hint tone="danger">Connect wallet first.</Hint>
              )}
              {!scanComplete && (
                <Hint tone="warning">Run protected scan first.</Hint>
              )}
              {!confirmPreview && (
                <Hint tone="warning">Confirm preview review.</Hint>
              )}
              {!confirmRisk && (
                <Hint tone="warning">Confirm irreversible risk.</Hint>
              )}
            </Card>

            {plan && (
              <Card
                title="Protected demolition plan created"
                desc={`Plan ID: ${plan.id}`}
              >
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Ready for wallet signing simulation
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Created at {plan.createdAt}. Destination: {plan.destination}
                  </p>
                </div>

                <div className="space-y-3">
                  {plan.batches.map((batch, index) => (
                    <div
                      key={batch.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        Batch {index + 1}: {batch.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {batch.ops.length} operation(s)
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </main>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Wallet
                  </h3>
                  <p className="text-sm text-slate-500">
                    {walletConnected
                      ? "stellar-wallets-kit simulated"
                      : "Disconnected"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setWalletConnected((x) => !x)}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {walletConnected ? "Disconnect wallet" : "Connect wallet"}
              </button>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Readiness
              </h3>
              <div className="mt-5 space-y-3">
                <Status label="Wallet" ok={walletConnected} />
                <Status label="Scan complete" ok={scanComplete} />
                <Status
                  label="Destination set"
                  ok={Boolean(destination.trim())}
                />
                <Status label="Preview confirmed" ok={confirmPreview} />
                <Status label="Risk confirmed" ok={confirmRisk} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-blue-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Safety model
                </h3>
              </div>
              <div className="mt-5 space-y-3">
                <Security icon={Lock} text="Client-side signing only" />
                <Security icon={KeyRound} text="Multisig-aware batches" />
                <Security icon={Layers3} text="Preview before every batch" />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Card({ title, desc, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function Finding({ item, open, onClick }) {
  const Icon =
    item.status === "success"
      ? CheckCircle2
      : item.status === "danger"
      ? XCircle
      : AlertTriangle;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <Icon
            size={20}
            className={
              item.status === "danger"
                ? "text-rose-600"
                : item.status === "warning"
                ? "text-amber-600"
                : "text-emerald-600"
            }
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            {item.value}
          </span>
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </div>

      {open && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {item.details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {detail.label}
              </p>
              <p className="mt-1 break-words text-sm font-medium text-slate-800">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

function Batch({ batch, open, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{batch.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {batch.type} • {batch.ops.length} operation(s)
          </p>
        </div>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>

      {open && (
        <div className="mt-4 space-y-2">
          {batch.ops.length ? (
            batch.ops.map((op) => (
              <div
                key={op}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700"
              >
                {op}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">
              No selected operations in this batch.
            </div>
          )}
        </div>
      )}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Metric({ label, value, tone = "default" }) {
  const cls =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : tone === "info"
      ? "border-blue-200 bg-blue-50 text-blue-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, onCopy }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-sm font-semibold text-slate-900">
          {value}
        </span>
        <button
          onClick={onCopy}
          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-900"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function Confirm({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span className="text-sm font-medium leading-6 text-slate-700">
        {children}
      </span>
    </label>
  );
}

function Hint({ children, tone }) {
  return (
    <p
      className={`mt-3 text-sm ${
        tone === "danger" ? "text-rose-600" : "text-amber-600"
      }`}
    >
      {children}
    </p>
  );
}

function Status({ label, ok }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
          ok
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        {ok ? "Ready" : "Required"}
      </span>
    </div>
  );
}

function Security({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <Icon size={16} className="text-slate-500" />
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
}
