import { Contract } from 'ethers';

export type InterestModel = {
  lenderRate: string;
  reverseRate: string;
  address: string;
}

export type TransferProxy = {
  type: "ERC20" | "NFT" | "ERC721_LAZY" | "ERC1155_LAZY",
  address: string,
  contract?: Contract
  operatorConfigured?: boolean
}

export type BErc20TokenConfig = {
  beacon: {
    address: string,
    contract?: Contract
  },
  factory: {
    address: string,
  },
  instances: {
    [p: string]: BToken
  }
}

export type Token = {
  name: string,
  symbol: string,
  decimals: number,
  owner?: string,
  address: string
}

export type BToken = {
  name: string,
  symbol: string,
  decimals: number,
  underlying?: string,
  underlyingToken?: Token,
  contractType: "BErc20" | "BEther",
  initial_exchange_rate: string,
  payInFullInterestKey: string,
  payIn4InterestKey: string,
  priceOracle?: string,
  priceOracleContract?: {
    address: string,
    contract?: Contract
  },
  address: string
}

export type Nft = {
  name: string,
  symbol: string,
  baseURI: string,
  contractURI: string,
  contractType: "ERC721" | "ERC1155",
  address: string
}


export type BNftTokenConfig = {
  beacon: {
    address: string,
    contract?: Contract
  },
  factory: {
    address: string
  },
  instances: {
    [p: string]: Nft
  }
}

export type NetworkConfig = {
  contractHelper: {
    address: string
  },
  nfts: {
    erc721: BNftTokenConfig,
    erc1155: BNftTokenConfig
  },
  controller: {
    licensor: string,
    borrowRateLimit: string;
    maxCreaditLimit: string;
    address: string
  },
  royaltiesRegistry: {
    address: string
  },
  interests: {
    [p: string]: InterestModel
  },
  transferProxies: {
    [p: string]: TransferProxy
  },
  collectionAssetMatcher: {
    address: string
  },
  nftMarket: {
    payInFullInterestKey: string,
    payIn4InterestKey: string,
    transferProxy: string,
    erc20TransferProxy: string,
    borrowManager: string,
    address: string
  }
  btokens: {
    bether: BToken,
    berc20: BErc20TokenConfig
  },
  options: {
    confirmTime?: number,
    log: {
      level: "DEFAULT" | "NONE",
      verbose?: boolean
    }
  }
}
