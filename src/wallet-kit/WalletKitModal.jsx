import React, { useEffect, useMemo, useState } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import { WalletKitService } from "./services/global-service";
import { useStates } from "../contexts/StatesContext";
import { showErrorToast, showSuccessToast } from "../components/ToastComponent";
import { Copy } from "iconsax-react";

export default function WalletKitModal() {
  const [isAvailableMap, setIsAvailableMap] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [wasGenerated, setWasGenerated] = useState(false);
  const [isConnectingLocal, setIsConnectingLocal] = useState(false);

  const {
    walletKitIsOpen,
    setWalletKitIsOpen,
    setUserKey,
    setNetwork,
    setWalletApp,
  } = useStates();

  const stellarWalletKitOptions = WalletKitService.walletKit.modules;

  useEffect(() => {
    Promise.all(stellarWalletKitOptions.map(({ isAvailable }) => isAvailable()))
      .then((results) => {
        const map = new Map();

        results.forEach((isAvailable, index) => {
          map.set(stellarWalletKitOptions[index].productName, isAvailable);
        });

        setIsAvailableMap(map);
      })
      .catch(() => setIsAvailableMap(new Map()));
  }, [stellarWalletKitOptions]);

  useEffect(() => {
    if (walletKitIsOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 20);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [walletKitIsOpen]);

  const isValidSecret = useMemo(() => {
    try {
      if (!secretKey.trim()) return false;
      Keypair.fromSecret(secretKey.trim());
      return true;
    } catch {
      return false;
    }
  }, [secretKey]);

  const closeHandler = () => {
    setWalletKitIsOpen(false);
    setSecretKey("");
    setWasGenerated(false);
  };

  const handleDownload = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  async function handleConnectLocalSecret() {
    try {
      setIsConnectingLocal(true);

      if (!isValidSecret) {
        throw new Error("Enter a valid Stellar secret key.");
      }

      const result = await WalletKitService.connectWithSecret(
        secretKey,
        setUserKey,
        setNetwork
      );

      const publicKey = result?.publicKey || result;

      setWalletApp("local_keypair");
      setSecretKey("");
      setWasGenerated(false);
      setWalletKitIsOpen(false);

      showSuccessToast(`Connected local wallet: ${shortKey(publicKey)}`);
    } catch (error) {
      showErrorToast(error?.message || "Unable to connect local wallet.");
    } finally {
      setIsConnectingLocal(false);
    }
  }

  async function handleGenerateLocalKeypair() {
    try {
      setIsConnectingLocal(true);

      const result = await WalletKitService.generateLocalKeypair(
        setUserKey,
        setNetwork
      );

      if (!result?.secret) {
        throw new Error("Generated keypair did not return a secret key.");
      }

      setWalletApp("local_keypair");
      setSecretKey(result.secret);
      setWasGenerated(true);

      showSuccessToast(
        result.funded
          ? `Generated and funded wallet: ${shortKey(result.publicKey)}`
          : `Generated wallet: ${shortKey(result.publicKey)}`
      );
    } catch (error) {
      showErrorToast(error?.message || "Unable to generate wallet.");
    } finally {
      setIsConnectingLocal(false);
    }
  }

  async function handleCopySecret() {
    try {
      if (!secretKey) return;

      await navigator.clipboard.writeText(secretKey);
      showSuccessToast("Secret key copied");
    } catch {
      showErrorToast("Unable to copy secret key.");
    }
  }

  if (!shouldRender) return null;

  return (
    <div
      onClick={closeHandler}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-3 py-5 backdrop-blur-sm sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xl transform overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={closeHandler}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close wallet modal"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 32 32"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18.24 16L26.08 8.16C26.3721 7.86194 26.5348 7.46064 26.5327 7.04332C26.5306 6.62599 26.3638 6.22636 26.0687 5.93126C25.7736 5.63616 25.374 5.46944 24.9567 5.46734C24.5394 5.46523 24.1381 5.6279 23.84 5.92L16 13.76L8.16 5.92C7.86194 5.6279 7.46064 5.46523 7.04332 5.46734C6.62599 5.46944 6.22636 5.63616 5.93126 5.93126C5.63616 6.22636 5.46944 6.62599 5.46734 7.04332C5.46523 7.46064 5.6279 7.86194 5.92 8.16L13.76 16L5.92 23.84C5.6279 24.1381 5.46523 24.5394 5.46734 24.9567C5.46944 25.374 5.63616 25.7736 5.93126 26.0687C6.22636 26.3638 6.62599 26.5306 7.04332 26.5327C7.46064 26.5348 7.86194 26.3721 8.16 26.08L16 18.24L23.84 26.08C24.1381 26.3721 24.5394 26.5348 24.9567 26.5327C25.374 26.5306 25.7736 26.3638 26.0687 26.0687C26.3638 25.7736 26.5306 25.374 26.5327 24.9567C26.5348 24.5394 26.3721 26.3721 26.08 23.84L18.24 16Z" />
          </svg>
        </button>

        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-xl font-bold text-slate-950">Connect wallet</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose a wallet app or connect with a local Stellar secret key.
          </p>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-3">
            {stellarWalletKitOptions?.map((option) => {
              const isAvailable = isAvailableMap?.get(option?.productName);

              return (
                <button
                  type="button"
                  key={option?.productName}
                  onClick={async () => {
                    try {
                      if (isAvailable) {
                        await WalletKitService.login(
                          option?.productId,
                          setUserKey,
                          setNetwork
                        );

                        setWalletApp(option?.productId);
                        setWalletKitIsOpen(false);
                      } else {
                        handleDownload(option?.productUrl);
                      }
                    } catch (error) {
                      showErrorToast(
                        error?.message || "Unable to connect wallet."
                      );
                    }
                  }}
                  className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center">
                      <img
                        className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                        src={option?.productIcon}
                        alt={option?.productName || "Wallet"}
                      />

                      <div className="ml-4 min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-950">
                          {option?.productName}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {isAvailable ? "Available" : "Install wallet"}
                        </p>
                      </div>
                    </div>

                    <WalletActionIcon available={isAvailable} />
                  </div>
                </button>
              );
            })}

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-slate-900 text-white">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 15v2" />
                    <path d="M6 10V8a6 6 0 0 1 12 0v2" />
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-950">
                    Local keypair
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Import or generate a Stellar keypair for local browser
                    signing.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Secret key
                </label>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => {
                      setSecretKey(e.target.value);
                      setWasGenerated(false);
                    }}
                    placeholder="S..."
                    autoComplete="off"
                    spellCheck={false}
                    className="block min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                  />

                  <button
                    type="button"
                    onClick={handleCopySecret}
                    disabled={!secretKey}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Copy secret key"
                  >
                    <Copy size="18" variant="Bulk" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleConnectLocalSecret}
                  disabled={!isValidSecret || isConnectingLocal}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConnectingLocal ? "Connecting..." : "Connect keypair"}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateLocalKeypair}
                  disabled={isConnectingLocal}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generate keypair
                </button>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Stored encrypted in browser only. For real assets, wallet
                extensions are safer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletActionIcon({ available }) {
  if (!available) {
    return (
      <svg className="h-6 w-6 text-slate-500" viewBox="0 0 32 32" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26 20V24C26 25.1046 25.1046 26 24 26H8C6.89543 26 6 25.1046 6 24V20H8V24H24V20H26ZM17 16.5858L20.2929 13.2929L21.7071 14.7071L16 20.4142L10.2929 14.7071L11.7071 13.2929L15 16.5858V6H17V16.5858Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg className="h-6 w-6 text-slate-500" viewBox="0 0 32 32" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.6922 16L9.89742 7.20518L11.6026 5.5L22.1026 16L11.6026 26.5L9.89742 24.7948L18.6922 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function shortKey(key) {
  if (!key) return "";
  return `${key.slice(0, 6)}...${key.slice(-6)}`;
}
