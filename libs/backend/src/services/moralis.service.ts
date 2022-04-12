
import { moralis } from '../providers';
import { networkService } from './smart-contracts';
import { ethers } from 'ethers';
import { NftMeta } from './nft-contract.service';
import { ipfs } from './ipft.service';

export class MoralisService {
  async getAccountNFTs(options: {
    chain: string,
    account: string,
    cursor?: string,
    limit?: number
  }) {
    const res = await moralis.Web3API.account.getNFTs({
      ...options,
      address: options.account,
      chain: networkService.getNetwork(options.chain).id
    });

    console.log("11111111111111111111");
    const result = await Promise.all(res.result.map(item => ipfs.get<NftMeta>(item.token_uri).then(meta => ({
      contract: item.token_address,
      contractType: item.contract_type,
      tokenId: item.token_id,
      owner: item.owner_of,
      uri: item.token_uri,
      supply: item.amount,
      name: meta.name,
      image: meta.image,
      description: meta.description,
      edition: meta.edition,
      animation_url: meta.animation_url,
      attributes: meta.attributes
    }))));
    console.log("222222222222222222");
    return {
      total: res.total,
      page: res.page,
      limit: res.page_size,
      cursor: res.cursor,
      result: result
    };
  }

  async getAccountTokenBalances(options: {
    chain: string,
    account: string
  }) {
    return await moralis.Web3API.account.getTokenBalances({
      ...options,
      address: options.account,
      chain: networkService.getNetwork(options.chain).id,
    });
  }

  async getContractTokenIds(options: {
    chain: string,
    contract: string,
    offset: number,
    limit: number
  }) {
    return await moralis.Web3API.token.getAllTokenIds({
      ...options,
      address: options.contract,
      chain: networkService.getNetwork(options.chain).id,
    });
  }

  async getTokenIdMetadata(chain: string, contract: string, tokenId: string) {
    try {
      const nft = await moralis.Web3API.token.getTokenIdMetadata({
        chain: networkService.getNetwork(chain).id,
        address: contract,
        token_id: tokenId
      }).then(res => ({
        contract: res.token_address,
        tokenId: res.token_id,
        supply: +res.amount,
        contractType: res.contract_type,
        uri: res.token_uri,
        contractName: res.name,
        contractSymbol: res.symbol
      }));

      return { ...nft, ...(await ipfs.get<NftMeta>(nft.uri)), chain }
    } catch (error) {
      return null;
    }
  }

  async getTokenIdOwners(chain: string, contract: string, tokenId: string, limit?: number, cursor?: string) {
    const res = await moralis.Web3API.token.getTokenIdOwners({
      chain: networkService.getNetwork(chain).id,
      address: contract,
      token_id: tokenId,
      limit,
      cursor
    });

    return {
      total: res.total,
      page: res.page,
      limit: res.page_size,
      cursor: res.cursor,
      result: res.result.map(token => ({
        address: token.owner_of,
        supply: token.amount
      }))
    }
  }

  async getTokenIdTransfers(chain: string, contract: string, tokenId: string, limit?: number, cursor?: string) {
    const res = await moralis.Web3API.token.getWalletTokenIdTransfers({
      chain: networkService.getNetwork(chain).id,
      address: contract,
      token_id: tokenId,
      limit,
      cursor
    });

    return {
      total: res.total,
      page: res.page,
      limit: res.page_size,
      cursor: res.cursor,
      result: res.result.map(transfer => ({
        fromAddress: transfer.from_address,
        toAddress: transfer.to_address,
        amount: transfer.amount,
        timestamp: transfer.block_timestamp,
        transactionHash: transfer.transaction_hash,
        transactionType: transfer.from_address === ethers.constants.AddressZero ? 'mint' : 'transfer',
      }))
    }
  }
}

const moralisService = new MoralisService();
export { moralisService };
