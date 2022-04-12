/* eslint-disable @typescript-eslint/no-explicit-any */
import { NetworkConfig } from './models/network-config';
import * as bsc_testnet from './networks/bsc_testnet.json';

type Network = {
  id:
    | '0x1'
    | '0x3'
    | '0x4'
    | '0x5'
    | '0x2a'
    | '0x89'
    | '0x13881'
    | '0x38'
    | '0x61'
    | '0xa86a'
    | '0xa869'
    | '0xfa';
  name: string;
  config: NetworkConfig;
  provider: string;
};

const networks: { [key: string]: Network } = {
  // eth: {
  //   id: "0x1",
  //   name: "eth"
  // },
  // ropsten: {
  //   id: "0x3",
  //   name: "ropsten"
  // },
  // rinkeby: {
  //   id: "0x4",
  //   name: "rinkeby"
  // },
  // goerli: {
  //   id: "0x5",
  //   name: "goerli"
  // },
  // kovan: {
  //   id: "0x2a",
  //   name: "kovan"
  // },

  // polygon: {
  //   id: "0x89",
  //   name: "polygon"
  // },
  // mumbai: {
  //   id: "0x13881",
  //   name: "mumbai"
  // },
  // bsc: {
  //   id: "0x38",
  //   name: "bsc"
  // },
  bsc_testnet: {
    id: '0x61',
    name: 'bsc testnet',
    config: bsc_testnet as any,
    provider:
      'https://speedy-nodes-nyc.moralis.io/e0c85e13c652f52aed15ca31/bsc/testnet',
  },
  // avalanche: {
  //   id: "0xa86a",
  //   name: "avalanche"
  // },
  // fantom: {
  //   id: "0xfa",
  //   name: "fantom"
  // }
};

class NetworkService {
  getNetwork = (chain: string) => {
    return networks[chain];
  };

  getNetworks = () => {
    return networks;
  };

  getConfig = (chain: string) => {
    return networks[chain].config;
  };

  getProvider = (chain: string) => {
    return networks[chain].provider;
  };
}
const networkService = new NetworkService();
export { networkService };
