import { Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";

const STORAGE_KEY = "sorobuild.local_keypair.v1";
const WALLET_TYPE_KEY = "sorobuild.wallet_type.v1";

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function sha256(input) {
  const data = new TextEncoder().encode(input);
  return crypto.subtle.digest("SHA-256", data);
}

async function getDeviceKey() {
  const raw = await sha256(`${location.origin}:sorobuild-local-wallet`);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encryptSecret(secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getDeviceKey();

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(secret)
  );

  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(encrypted),
  };
}

async function decryptSecret(payload) {
  const key = await getDeviceKey();

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToBytes(payload.iv),
    },
    key,
    base64ToBytes(payload.data)
  );

  return new TextDecoder().decode(decrypted);
}

export const LocalKeypairWallet = {
  type: "local_keypair",

  async connectWithSecret(secret) {
    const normalized = secret.trim();
    const keypair = Keypair.fromSecret(normalized);

    const encrypted = await encryptSecret(normalized);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
    localStorage.setItem(WALLET_TYPE_KEY, this.type);

    return keypair.publicKey();
  },

  async generateAndConnect() {
    const keypair = Keypair.random();
    const secret = keypair.secret();

    const encrypted = await encryptSecret(secret);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
    localStorage.setItem(WALLET_TYPE_KEY, this.type);

    return {
      publicKey: keypair.publicKey(),
      secret,
    };
  },

  async getSecret() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("No local keypair found.");

    return decryptSecret(JSON.parse(raw));
  },

  async getPublicKey() {
    const secret = await this.getSecret();
    return Keypair.fromSecret(secret).publicKey();
  },

  isConnected() {
    return localStorage.getItem(WALLET_TYPE_KEY) === this.type;
  },

  disconnect() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WALLET_TYPE_KEY);
  },

  async signTx(xdr, network) {
    const secret = await this.getSecret();
    const keypair = Keypair.fromSecret(secret);

    const networkKey = network?.network || network;
    const passphrase =
      network?.networkPassphrase || Networks[networkKey] || Networks.TESTNET;

    const tx = TransactionBuilder.fromXDR(xdr, passphrase);
    tx.sign(keypair);

    return tx.toXDR();
  },
};
