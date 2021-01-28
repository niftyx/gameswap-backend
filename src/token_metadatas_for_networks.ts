import { ChainId } from "./types";

export interface TokenMetadataAndChainAddresses {
  symbol: string;
  decimals: number;
  name: string;
  tokenAddresses: {
    [ChainId.Mainnet]: string;
    [ChainId.Kovan]: string;
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
      [ChainId.Mainnet]: "0xaac41ec512808d64625576eddd580e7ea40ef8b2",
      [ChainId.Kovan]: "0xb2c7d27f78bec818391498dc4108ab782d65cd76",
    },
  },
  {
    symbol: "wETH",
    name: "wrapped ETH",
    decimals: 18,
    tokenAddresses: {
      [ChainId.Mainnet]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      [ChainId.Kovan]: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    },
  },
];

export const Test721TokenMetaData: TokenMetadataAndChainAddresses = {
  symbol: "T71",
  name: "Test721",
  decimals: 18,
  tokenAddresses: {
    [ChainId.Mainnet]: "0x254D5259539b3ec85Cd76A1931899ec7E8851dD4",
    [ChainId.Kovan]: "0xb917795f6b1107f2635df03df1f4a97c29959dd9",
  },
};
