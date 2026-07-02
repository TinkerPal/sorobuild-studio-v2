import LobstrExtensionServiceClass from "./lobstr-extension.service";
// import ModalServiceClass from "./modal.service";
import SorobanServiceClass from "./soroban/soroban.service";
import WalletKitServiceClass from "./wallet-kit.service";

export const LobstrExtensionService = new LobstrExtensionServiceClass();
export const SorobanService = new SorobanServiceClass();
// export const AssetsService = new AssetsServiceClass();
export const WalletKitService = new WalletKitServiceClass();
