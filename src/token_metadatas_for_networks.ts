import { ChainId } from "./types";

export interface TokenMetadataAndChainAddresses {
  symbol: string;
  decimals: number;
  name: string;
  tokenAddresses: {
    [ChainId.AVAXTEST]: string;
    [ChainId.AVAXMAIN]: string;
  };
}

// Most token metadata taken from https://github.com/MetaMask/eth-contract-metadata/
// And https://github.com/compound-finance/compound-protocol/blob/master/networks/kovan.json
// And https://developer.kyber.network/docs/Environments-Kovan/
// tslint:disable:max-file-line-count
export const ERC20TokenMetaDatasForChains: TokenMetadataAndChainAddresses[] = [
  {
    symbol: "GSWP",
    name: "GameSwap",
    decimals: 18,
    tokenAddresses: {
      [ChainId.AVAXTEST]: "0x1EeBC9a0e84006efE4067eDC78f3eB7636E730D5",
      [ChainId.AVAXMAIN]: "0x444806D2C0856c12dD8DB239b809Fc4641FCbB5E",
    },
  },
  {
    symbol: "SHROOM",
    name: "Shroom Finance",
    decimals: 18,
    tokenAddresses: {
      [ChainId.AVAXTEST]: "0xbE0382B9cbD516527431beADad01A683641956c4",
      [ChainId.AVAXMAIN]: "0x444806D2C0856c12dD8DB239b809Fc4641FCbB5E",
    },
  },
];
