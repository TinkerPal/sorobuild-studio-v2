import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
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

const supportedLanguages = [
  "English",
  "Spanish",
  "French",
  "Arabic",
  "Portuguese",
  "Turkish",
  "Chinese",
  "Hindi",
  "Russian",
];

const dummyAccount = {
  address: "GCBY4KZ4QW7QJXJH2AHY6E3Y7MSA7VZSLK4FZTYE6OVV4TQZ3DUMMY",
  network: "TESTNET",
  destination: "GDESTINATIONEXCHANGEORWALLETADDRESSDUMMY",
  estimatedRecoverableXlm: "28.4319221",
  baseReserveXlm: "1.0000000",
  riskLevel: "Medium",
};

const dummyFindings = [
  {
    id: "sponsorships",
    label: "Sponsorships",
    value: "None found",
    status: "success",
    description: "Account is not sponsoring reserves for other accounts.",
  },
  {
    id: "multisig",
    label: "Multisig",
    value: "2 extra signers",
    status: "warning",
    description:
      "Extra signers must be removed and thresholds adjusted before merge.",
  },
  {
    id: "trustlines",
    label: "Trustlines",
    value: "5 active",
    status: "warning",
    description: "All non-native asset trustlines must be removed.",
  },
  {
    id: "data",
    label: "Data Entries",
    value: "3 entries",
    status: "warning",
    description: "Account data entries must be deleted before merge.",
  },
  {
    id: "offers",
    label: "Classic DEX Offers",
    value: "2 open",
    status: "warning",
    description: "Open offers must be cancelled before asset cleanup.",
  },
  {
    id: "claimable",
    label: "Claimable Balances",
    value: "4 pending",
    status: "info",
    description: "User can choose which balances to claim before closing.",
  },
  {
    id: "soroban",
    label: "Soroban Positions",
    value: "3 detected",
    status: "danger",
    description:
      "Blend, Aquarius, and Soroswap positions require protocol-specific exits.",
  },
  {
    id: "allowances",
    label: "Token Allowances",
    value: "7 active",
    status: "danger",
    description:
      "Active authorizations should be reviewed or revoked before closure.",
  },
];

const dummySteps = [
  {
    id: 1,
    title: "Review account blockers",
    category: "Scan",
    status: "ready",
    operations: 0,
    description:
      "Inspect sponsorships, thresholds, signers, balances, offers, data entries, and DeFi positions.",
  },
  {
    id: 2,
    title: "Cancel open DEX offers",
    category: "Classic",
    status: "ready",
    operations: 2,
    description: "Cancel all active Stellar DEX offers owned by the account.",
  },
  {
    id: 3,
    title: "Exit Soroban DeFi positions",
    category: "Soroban",
    status: "needs-review",
    operations: 3,
    description:
      "Withdraw from Blend, Aquarius, Soroswap, and other supported protocol positions.",
  },
  {
    id: 4,
    title: "Claim selected claimable balances",
    category: "Classic",
    status: "optional",
    operations: 4,
    description:
      "Claim pending balances selected by the user before final cleanup.",
  },
  {
    id: 5,
    title: "Swap remaining assets to XLM",
    category: "Routing",
    status: "ready",
    operations: 5,
    description:
      "Route classic and Soroban tokens into XLM or a selected target asset.",
  },
  {
    id: 6,
    title: "Remove trustlines and data entries",
    category: "Cleanup",
    status: "ready",
    operations: 8,
    description:
      "Delete data entries and remove empty trustlines after asset conversion.",
  },
  {
    id: 7,
    title: "Remove extra signers and adjust thresholds",
    category: "Security",
    status: "needs-signatures",
    operations: 1,
    description:
      "Prepare account for final merge while respecting multisig requirements.",
  },
  {
    id: 8,
    title: "Merge account through mediator",
    category: "Final",
    status: "locked",
    operations: 1,
    description:
      "Merge the account into a temporary mediator, then send recovered XLM to the destination wallet.",
  },
];

const dummyAssets = [
  { code: "XLM", issuer: "Native", balance: "16.2000000", route: "Keep" },
  { code: "USDC", issuer: "Centre.io", balance: "42.91", route: "Swap to XLM" },
  { code: "AQUA", issuer: "Aquarius", balance: "991.21", route: "Swap to XLM" },
  { code: "BLND", issuer: "Blend", balance: "12.40", route: "Swap to XLM" },
];

export default function AccountDemolisher() {
  const [language, setLanguage] = useState("English");
  const [destination, setDestination] = useState(dummyAccount.destination);
  const [confirmOne, setConfirmOne] = useState(false);
  const [confirmTwo, setConfirmTwo] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const canExecute = confirmOne && confirmTwo && destination.trim();

  const summary = useMemo(() => {
    const warnings = dummyFindings.filter((x) => x.status === "warning").length;
    const dangers = dummyFindings.filter((x) => x.status === "danger").length;
    const totalOps = dummySteps.reduce((sum, step) => sum + step.operations, 0);

    return { warnings, dangers, totalOps };
  }, []);

  function runDummyScan() {
    setIsProcessing(true);
    setTimeout(() => {
      setScanComplete(true);
      setIsProcessing(false);
    }, 900);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Hero
          language={language}
          setLanguage={setLanguage}
          isProcessing={isProcessing}
          onScan={runDummyScan}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-6">
            <AccountOverview summary={summary} />

            <SafetyWarning />

            <ScanResults scanComplete={scanComplete} />

            <CleanupPlan />

            <AssetRouting />

            <FinalConfirmation
              destination={destination}
              setDestination={setDestination}
              confirmOne={confirmOne}
              setConfirmOne={setConfirmOne}
              confirmTwo={confirmTwo}
              setConfirmTwo={setConfirmTwo}
              canExecute={canExecute}
            />
          </main>

          <aside className="space-y-6">
            <WalletCard />
            <RecoveryCard />
            <SecurityCard />
            <LanguageCard language={language} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Hero({ language, setLanguage, isProcessing, onScan }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%)] px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              <Trash2 size={14} />
              Account Demolisher
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Safely close Stellar accounts with classic and Soroban cleanup.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Preview blockers, exit DeFi positions, remove trustlines, clear
              data entries, revoke allowances, convert assets, and merge the
              account through a non-custodial client-side signing flow.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onScan}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={isProcessing ? "animate-spin" : ""}
                />
                {isProcessing ? "Scanning account..." : "Run dry-run scan"}
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Eye size={16} />
                View allowance audit
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <Stat label="Network" value={dummyAccount.network} />
            <Stat label="Risk" value={dummyAccount.riskLevel} />
            <Stat label="Languages" value="9" />
            <Stat label="Mode" value="Dummy Data" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Globe2 size={18} className="text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Interface language
              </p>
              <p className="text-xs text-slate-500">
                UI copy is structured for localization.
              </p>
            </div>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-slate-900"
          >
            {supportedLanguages.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

function AccountOverview({ summary }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        title="Account closure overview"
        description="Dummy account scan summary for production UI testing."
      />

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <Metric
          label="Recoverable XLM"
          value={dummyAccount.estimatedRecoverableXlm}
          tone="success"
        />
        <Metric label="Base reserve" value={dummyAccount.baseReserveXlm} />
        <Metric label="Warnings" value={summary.warnings} tone="warning" />
        <Metric label="Total operations" value={summary.totalOps} tone="info" />
      </div>

      <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
        <InfoRow label="Source account" value={dummyAccount.address} copy />
        <InfoRow
          label="Default destination"
          value={dummyAccount.destination}
          copy
        />
      </div>
    </section>
  );
}

function SafetyWarning() {
  return (
    <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600">
          <AlertTriangle size={22} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-rose-950">
            Account closure is irreversible
          </h2>
          <p className="mt-1 text-sm leading-6 text-rose-800">
            This tool should never custody user funds. Transactions must be
            generated locally, signed on the client, reviewed step-by-step, and
            submitted only after explicit confirmation.
          </p>
        </div>
      </div>
    </section>
  );
}

function ScanResults({ scanComplete }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        title="Dry-run scan results"
        description="Detected blockers that must be handled before account merge."
      />

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
        {dummyFindings.map((item) => (
          <FindingCard key={item.id} item={item} />
        ))}
      </div>

      {!scanComplete && (
        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 sm:px-6">
          Run scan to inspect account state.
        </div>
      )}
    </section>
  );
}

function CleanupPlan() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        title="Sequential cleanup plan"
        description="The production flow should split cleanup into safe transaction batches."
      />

      <div className="space-y-3 px-5 py-5 sm:px-6">
        {dummySteps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
    </section>
  );
}

function AssetRouting() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        title="Asset routing preview"
        description="Dummy balances showing how remaining assets may be converted before merge."
      />

      <div className="overflow-x-auto px-5 py-5 sm:px-6">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-3 font-semibold">Asset</th>
              <th className="py-3 font-semibold">Issuer</th>
              <th className="py-3 font-semibold">Balance</th>
              <th className="py-3 font-semibold">Route</th>
            </tr>
          </thead>
          <tbody>
            {dummyAssets.map((asset) => (
              <tr key={asset.code} className="border-b border-slate-100">
                <td className="py-4 font-semibold text-slate-900">
                  {asset.code}
                </td>
                <td className="py-4 text-slate-600">{asset.issuer}</td>
                <td className="py-4 text-slate-600">{asset.balance}</td>
                <td className="py-4">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {asset.route}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FinalConfirmation({
  destination,
  setDestination,
  confirmOne,
  setConfirmOne,
  confirmTwo,
  setConfirmTwo,
  canExecute,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        title="Final merge destination"
        description="Production mode should use a mediator account when the final destination does not support ACCOUNT_MERGE."
      />

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Destination wallet or exchange address
          </label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            placeholder="G..."
          />
          <p className="mt-2 text-xs text-slate-500">
            Dummy input. Production should validate address, memo requirements,
            and exchange support.
          </p>
        </div>

        <ConfirmBox
          checked={confirmOne}
          onChange={setConfirmOne}
          label="I understand this action can permanently close the source account."
        />

        <ConfirmBox
          checked={confirmTwo}
          onChange={setConfirmTwo}
          label="I understand secret keys must never be sent to the server."
        />

        <button
          disabled={!canExecute}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />
          Build final dummy demolition plan
        </button>
      </div>
    </section>
  );
}

function WalletCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Wallet size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Wallet connection
          </h3>
          <p className="text-sm text-slate-500">stellar-wallets-kit ready</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <StatusRow label="Connection" value="Connected" tone="success" />
        <StatusRow label="Signer mode" value="Client-side" tone="success" />
        <StatusRow label="Secret key upload" value="Disabled" tone="warning" />
      </div>

      <button className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Change wallet
      </button>
    </section>
  );
}

function RecoveryCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        Recovery estimate
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Based on dummy routing and cleanup simulation.
      </p>

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Estimated final amount
        </p>
        <p className="mt-1 text-2xl font-semibold text-emerald-950">
          {dummyAccount.estimatedRecoverableXlm} XLM
        </p>
      </div>
    </section>
  );
}

function SecurityCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <ShieldCheck size={20} />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Safety model</h3>
      </div>

      <div className="mt-5 space-y-3">
        <SecurityItem icon={Lock} text="Non-custodial transaction signing" />
        <SecurityItem icon={KeyRound} text="Multisig-aware execution flow" />
        <SecurityItem
          icon={Layers3}
          text="Batch-by-batch transaction preview"
        />
      </div>
    </section>
  );
}

function LanguageCard({ language }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        Localization status
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Selected language: {language}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {supportedLanguages.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              item === language
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Metric({ label, value, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : tone === "info"
      ? "border-blue-200 bg-blue-50 text-blue-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function FindingCard({ item }) {
  const icon =
    item.status === "success"
      ? CheckCircle2
      : item.status === "danger"
      ? XCircle
      : AlertTriangle;

  const Icon = icon;

  const toneClass =
    item.status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : item.status === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : item.status === "info"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneClass}`}
        >
          <Icon size={18} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {item.label}
            </h3>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {item.value}
            </span>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-700">
            {step.id}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {step.title}
              </h3>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                {step.category}
              </span>
            </div>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {step.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:min-w-[180px]">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            {step.operations} ops
          </span>
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, copy }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-sm font-semibold text-slate-900">
          {value}
        </span>
        {copy && (
          <button className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:text-slate-900">
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function StatusRow({ label, value, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function SecurityItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <Icon size={16} className="text-slate-500" />
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
}

function ConfirmBox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300"
      />
      <span className="text-sm font-medium leading-6 text-slate-700">
        {label}
      </span>
    </label>
  );
}
