import { CreateQuoteRequest } from "@libs/models";
import { QuoteRepo } from '@api/repositories';
import { CollectionService, NftService } from '@api/services';
import { quoteHelper } from "@libs/share";

class QuoteService {
  async create(request: CreateQuoteRequest) {
    request.hashKey = quoteHelper.hashKey(quoteHelper.enc(request));
    return request.hashKey;

    const asset = request.data.isMakeFill ? request.make : request.take;
    const collection = await CollectionService.details(request.chain, asset.assetType.contract);
    const collectionMeta = collection ?? await CollectionService.getMeta(request.chain, asset.assetType.contract);

    const nft = await NftService.details("a", request.chain, asset.assetType.contract, asset.assetType.tokenId);
    return QuoteRepo.create(request, nft as any, collectionMeta as any);
  }

  async details(chain: string, hashKey: string) {
    return await QuoteRepo.getById(chain, hashKey);
  }
}

export default new QuoteService();
