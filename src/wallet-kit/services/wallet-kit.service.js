import {
  StellarWalletsKit,
  FreighterModule,
  FREIGHTER_ID,
  xBullModule,
  AlbedoModule,
  HanaModule,
  RabetModule,
  HotWalletModule,
} from "@creit.tech/stellar-wallets-kit";
import { WatchWalletChanges } from "@stellar/freighter-api";
import { Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import { toast } from "sonner";
import EventService from "./event.service";

export const WalletKitEvents = {
  login: "login",
  logout: "logout",
  accountChanged: "accountChanged",
};

const LOCAL_WALLET_TYPE = "local_keypair";
const LOCAL_WALLET_STORAGE_KEY = "sorobuild.local_keypair.v1";
const WALLET_TYPE_STORAGE_KEY = "sorobuild.wallet_type.v1";

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  return crypto.subtle.digest("SHA-256", encoded);
}

async function getLocalEncryptionKey() {
  const hash = await sha256(`${window.location.origin}:sorobuild-local-wallet`);

  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encryptSecret(secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getLocalEncryptionKey();

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
  const key = await getLocalEncryptionKey();

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

export default class WalletKitServiceClass {
  walletKit;
  event = new EventService();
  watcher = null;

  constructor() {
    this.walletKit = new StellarWalletsKit({
      network: Networks.PUBLIC,
      modules: [
        new FreighterModule(),
        new HotWalletModule(),
        new xBullModule(),
        new AlbedoModule(),
        new HanaModule(),
        new RabetModule(),
      ],
      selectedWalletId: FREIGHTER_ID,
    });
  }

  async startFreighterWatching(publicKey, setUserKey, setNetwork) {
    if (!this.watcher) {
      this.watcher = new WatchWalletChanges(1000);
    }

    this.watcher.watch(async ({ address }) => {
      if (publicKey === address || !address) return;

      const network = await this.walletKit.getNetwork();

      setNetwork?.(network);
      setUserKey?.(address);

      this.event.trigger({
        type: WalletKitEvents.accountChanged,
        publicKey: address,
      });
    });
  }

  stopFreighterWatching() {
    this.watcher?.stop();
    this.watcher = null;
  }

  async login(id, setUserKey, setNetwork) {
    try {
      this.walletKit.setWallet(id);

      const { address } = await this.walletKit.getAddress();

      let network;

      if (id === FREIGHTER_ID) {
        network = await this.walletKit.getNetwork();
      } else {
        network = {
          network: "TESTNET",
          networkPassphrase: Networks.TESTNET,
        };
      }

      localStorage.setItem(WALLET_TYPE_STORAGE_KEY, "wallet_kit");
      localStorage.setItem("sorobuild.wallet_app.v1", id);

      setNetwork?.(network);
      setUserKey?.(address);

      if (id === FREIGHTER_ID) {
        this.startFreighterWatching(address, setUserKey, setNetwork);
      } else {
        this.stopFreighterWatching();
      }

      this.event.trigger({
        type: WalletKitEvents.login,
        publicKey: address,
        id,
      });

      return {
        publicKey: address,
        network,
      };
    } catch (e) {
      toast.error(e?.message || "Wallet connection failed");
      throw e;
    }
  }

  async connectWithSecret(secret, setUserKey, setNetwork, network) {
    try {
      const normalizedSecret = secret.trim();
      const keypair = Keypair.fromSecret(normalizedSecret);
      const publicKey = keypair.publicKey();

      const encrypted = await encryptSecret(normalizedSecret);

      localStorage.setItem(LOCAL_WALLET_STORAGE_KEY, JSON.stringify(encrypted));
      localStorage.setItem(WALLET_TYPE_STORAGE_KEY, LOCAL_WALLET_TYPE);
      localStorage.setItem("sorobuild.wallet_app.v1", LOCAL_WALLET_TYPE);

      const resolvedNetwork = network || {
        network: "TESTNET",
        networkPassphrase: Networks.TESTNET,
      };

      setUserKey?.(publicKey);
      setNetwork?.(resolvedNetwork);

      this.stopFreighterWatching();

      this.event.trigger({
        type: WalletKitEvents.login,
        publicKey,
        id: LOCAL_WALLET_TYPE,
      });

      return {
        publicKey,
        network: resolvedNetwork,
      };
    } catch (e) {
      toast.error(e?.message || "Invalid Stellar secret key");
      throw e;
    }
  }

  // async generateLocalKeypair(setUserKey, setNetwork, network) {
  //   const keypair = Keypair.random();
  //   const secret = keypair.secret();

  //   const result = await this.connectWithSecret(
  //     secret,
  //     setUserKey,
  //     setNetwork,
  //     network
  //   );

  //   return {
  //     ...result,
  //     secret,
  //   };
  // }

  async generateLocalKeypair(setUserKey, setNetwork, network) {
    const keypair = Keypair.random();
    const secret = keypair.secret();
    const publicKey = keypair.publicKey();

    const resolvedNetwork = network || {
      network: "TESTNET",
      networkPassphrase: Networks.TESTNET,
    };

    const result = await this.connectWithSecret(
      secret,
      setUserKey,
      setNetwork,
      resolvedNetwork
    );

    if (resolvedNetwork?.network === "TESTNET") {
      await this.fundTestnetAccount(publicKey);
    }

    return {
      ...result,
      publicKey,
      secret,
      funded: resolvedNetwork?.network === "TESTNET" ? true : false,
    };
  }

  async fundTestnetAccount(publicKey) {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );

    if (!response.ok) {
      throw new Error("Keypair generated, but Friendbot funding failed.");
    }

    return response.json();
  }

  async getLocalSecret() {
    const raw = localStorage.getItem(LOCAL_WALLET_STORAGE_KEY);

    if (!raw) {
      throw new Error("No local keypair found in this browser.");
    }

    return decryptSecret(JSON.parse(raw));
  }

  isLocalKeypairConnected() {
    return localStorage.getItem(WALLET_TYPE_STORAGE_KEY) === LOCAL_WALLET_TYPE;
  }

  async restoreLogin(id, publicKey, setUserKey, setNetwork) {
    if (id === LOCAL_WALLET_TYPE || this.isLocalKeypairConnected()) {
      const secret = await this.getLocalSecret();
      const restoredPublicKey = Keypair.fromSecret(secret).publicKey();

      setUserKey?.(restoredPublicKey);
      setNetwork?.({
        network: "TESTNET",
        networkPassphrase: Networks.TESTNET,
      });

      return restoredPublicKey;
    }

    this.walletKit.setWallet(id);

    if (id === FREIGHTER_ID) {
      this.startFreighterWatching(publicKey, setUserKey, setNetwork);
    }

    return publicKey;
  }

  async signTx(xdrRaw, network) {
    const networkPassphrase =
      network?.networkPassphrase ||
      Networks[network?.network] ||
      Networks.TESTNET;

    console.log("the value of is local", this.isLocalKeypairConnected());

    if (this.isLocalKeypairConnected()) {
      const secret = await this.getLocalSecret();
      const keypair = Keypair.fromSecret(secret);

      const tx = TransactionBuilder.fromXDR(xdrRaw, networkPassphrase);
      tx.sign(keypair);

      return tx.toXDR();
    }

    const { signedTxXdr } = await this.walletKit.signTransaction(xdrRaw, {
      networkPassphrase,
    });

    return signedTxXdr;
  }

  disconnectLocalKeypair() {
    localStorage.removeItem(LOCAL_WALLET_STORAGE_KEY);
    localStorage.removeItem(WALLET_TYPE_STORAGE_KEY);
    localStorage.removeItem("sorobuild.wallet_app.v1");
  }
}
