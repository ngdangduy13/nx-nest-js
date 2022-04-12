import { CreateNftRequest, FavoriteNftRequest, ViewNftRequest } from "@libs/models";
import { NftRepo, QuoteRepo, AccountRepo } from '@api/repositories';
import { CollectionService } from '@api/services';
import { moralisService } from "@backend/services";
import { Nft } from "@prisma/client";

class NftService {
  async create(request: CreateNftRequest) {
    const collection = await CollectionService.details(request.chain, request.contract);
    const collectionMeta = collection ?? await CollectionService.getMeta(request.chain, request.contract);

    return NftRepo.upsertWithCollection({
      ...request as any,
      owner: request.creators[0].account,
      isLazy: true,
      minted: false,
      tokenId: request.tokenId
    }, collectionMeta);
  }

  async addView(ipAddress: string, account: string, request: ViewNftRequest) {
    return NftRepo.addView(ipAddress, account, request);
  }

  async addFavorite(account: string, request: FavoriteNftRequest) {
    return NftRepo.addFavorite(account, request);
  }

  async getMintedNfts(chain: string, account: string, cursor?: string, limit?: number) {
    const res = await moralisService.getAccountNFTs({ chain, account, cursor, limit });
    const sellingQuotes = await QuoteRepo.getSellingByAccount(chain, account);

    return {
      ...res,
      result: res.result.map(token => ({
        ...token,
        onSale: sellingQuotes.find(q =>
          token.contract === q.makeAssetContract &&
          token.tokenId === q.makeAssetTokenId)?.makeAssetValue || 0
      }))
    };
  }

  async getLazyNfts(chain: string, account: string, offset?: number, limit?: number) {
    const nfts = await NftRepo.getByAccount(chain, account, offset, limit);

    return nfts;
  }

  async details(uid: string, chain: string, contract: string, tokenId: string) {
    const [minted, lazy] = await Promise.all([
      moralisService.getTokenIdMetadata(chain, contract, tokenId),
      NftRepo.getById(chain, contract, tokenId).then(nft => nft ?? {} as Nft)
    ]);

    return { ...lazy, ...minted }
  }

  async search() {
    return NftRepo.search();
  }

  async getNftOwners(chain: string, contract: string, tokenId: string, limit?: number, cursor?: string) {
    const res = await moralisService.getTokenIdOwners(chain, contract, tokenId, limit, cursor);
    const accounts = await AccountRepo.getByIds(res.result.map(owner => owner.address));

    return {
      ...res,
      result: res.result.map(owner => {
        const account = accounts.find(acc => acc.id === owner.address) || {};
        return {
          ...owner,
          ...account,
          id: undefined
        }
      })
    };
  }

  async getNfTransfers(chain: string, contract: string, tokenId: string, limit?: number, cursor?: string) {
    const res = await moralisService.getTokenIdTransfers(chain, contract, tokenId, limit, cursor);
    const accounts = await AccountRepo.getByIds([
      ...res.result.map(transfer => transfer.fromAddress),
      ...res.result.map(transfer => transfer.toAddress)
    ]);

    return {
      ...res,
      result: res.result.map(transfer => {
        const fromAccount = accounts.find(acc => acc.id === transfer.fromAddress) || {};
        const toAccount = accounts.find(acc => acc.id === transfer.toAddress) || {};
        return {
          ...transfer,
          fromAccount,
          toAccount
        }
      })
    };
  }
}

export default new NftService();
