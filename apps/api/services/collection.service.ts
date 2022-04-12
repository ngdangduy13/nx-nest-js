import { CreateCollectionRequest } from "@libs/models";
import { CollectionRepo } from '@api/repositories';
import { nftContractService } from '@backend/services';

class CollectionService {
  async create(request: CreateCollectionRequest) {
    const meta = await this.getMeta(request.chain, request.contract);
    await CollectionRepo.upsert(meta);
  }

  async details(chain: string, contract: string) {
    return await CollectionRepo.getById(chain, contract);
  }

  async getMeta(chain: string, contract: string) {
    const meta = await nftContractService.contractMeta(chain, contract);
    return {
      ...meta,
      chain,
      contract
    };
  }
}

export default new CollectionService();
