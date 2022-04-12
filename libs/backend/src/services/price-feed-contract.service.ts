import { SmartContractService } from './smart-contract.service';
import priceFeedArtifacts from './smart-contracts/abi/PriceFeed.json';

export class PriceFeedService extends SmartContractService {
  get abi() {
    return priceFeedArtifacts.abi;
  }

  public async lastestAnswer(chain: string, contract: string) {
    return await this.read(chain, contract, 'latestAnswer', this.abi);
  }

  public async decimals(chain: string, contract: string) {
    return await this.read(chain, contract, 'decimals', this.abi);
  }
}

const priceFeedService = new PriceFeedService();
export { priceFeedService };
