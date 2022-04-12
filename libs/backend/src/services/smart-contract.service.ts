/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import { networkService } from './smart-contracts'

export class SmartContractService {
  providers: { [p: string]: Web3 } = {};

  getProvider = (chain: string) => {
    let provider = this.providers[chain];
    if (!provider) {
      provider = new Web3(new Web3.providers.HttpProvider(networkService.getProvider(chain)));
      this.providers[chain] = provider;
    }
    return provider;
  }

  public async read(chain: string, address: string, name: string, abi: any, ...params: any[]) {
    const provider = this.getProvider(chain);
    const contract = new provider.eth.Contract(abi, address);
    return await contract.methods[name](...params).call({ from: '0x8863ae48646c493efF8cd54f9Ffb8Be89669E62A' });
  }
}
