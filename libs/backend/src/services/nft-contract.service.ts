import { ipfs } from './ipft.service';
import { SmartContractService } from './smart-contract.service';
import erc721Artifacts from './smart-contracts/abi/ERC721BePayMinimal.json';
import erc1155Artifacts from './smart-contracts/abi/ERC1155BePay.json';

export type ContractMeta = {
  name?: string,
  owner: string,
  symbol?: string,
  description?: string,
  type?: string,
  image?: string,
  banner?: string
}

export type NftMeta = {
  description?: string;
  edition?: number;
  image?: string;
  name?: string;
  animation_url?: string;
  attributes?: any[];
  owner?: string
}

export class NftContractService extends SmartContractService {

  get abi() {
    return erc721Artifacts.abi;
  }

  public async name(chain: string, contract: string) {
    try {
      return await this.read(chain, contract, 'name', this.abi);
    } catch {
      return 'Unname';
    }
  }

  public async symbol(chain: string, contract: string) {
    try {
      return await this.read(chain, contract, 'symbol', this.abi);
    } catch {
      return 'Unsymbol';
    }
  }

  public async owner(chain: string, contract: string) {
    try {
      return await this.read(chain, contract, 'owner', this.abi);
    } catch {
      return;
    }
  }

  public async contractURI(chain: string, contract: string) {
    return await this.read(chain, contract, 'contractURI', this.abi);
  }

  public async contractType(chain: string, contract: string) {
    const _INTERFACE_ID_ERC721 = "0x80ac58cd";
    const _INTERFACE_ID_ERC1155 = "0xd9b67a26";

    try {
      const [isErc721, isErc1155] = await Promise.all([
        this.read(chain, contract, 'supportsInterface', this.abi, _INTERFACE_ID_ERC721),
        this.read(chain, contract, 'supportsInterface', this.abi, _INTERFACE_ID_ERC1155)
      ]);

      return isErc721 ? "ERC721" : (isErc1155 ? "ERC1155" : null);
    } catch {
      return;
    }
  }

  public async contractMeta(chain: string, contract: string) {
    const [contractUri, owner, name, symbol, type] = await Promise.all([
      this.contractURI(chain, contract),
      this.owner(chain, contract),
      this.name(chain, contract),
      this.symbol(chain, contract),
      this.contractType(chain, contract)
    ]);

    return ipfs.get<ContractMeta>(contractUri).then(res => ({
      ...res, owner, name, symbol, type, chain, contract
    }));
  }

  public async tokenURI(chain: string, contract: string, tokenId: string) {
    const [tokenURI, uri] = await Promise.all([
      this.read(chain, contract, 'tokenURI', tokenId).catch(() => (null)),
      this.read(chain, contract, 'uri', tokenId).catch(() => (null))
    ]);
    return tokenURI || uri;
  }

  public async tokenMeta(chain: string, contract: string, tokenId: string) {
    const tokenUri = await this.tokenURI(chain, contract, tokenId);
    return ipfs.get<NftMeta>(tokenUri).then(meta => ({
      ...meta, chain, contract, tokenId
    }));
  }

  public async balanceOfToken(chain: string, contract: string, owner: string, tokenId: string) {
    const [erc721Copy, erc1155Copy] = await Promise.all([
      this.read(chain, contract, 'ownerOf', this.abi, tokenId).then((ownerOf: string) => ownerOf === owner ? 1 : 0),
      this.read(chain, contract, 'balanceOf', this.abi, owner, tokenId)
    ])
    return erc721Copy || erc1155Copy;
  }
}


export class Erc721Service extends NftContractService {

  public async balanceOf(chain: string, contract: string, owner: string) {
    return await this.read(chain, contract, 'balanceOf', this.abi, owner);
  }

  public async ownerOf(chain: string, contract: string, tokenId: string) {
    return await this.read(chain, contract, 'ownerOf', this.abi, tokenId);
  }
}


export class Erc1155Service extends NftContractService {

  get abi() {
    return erc1155Artifacts.abi;
  }

  public async balanceOf(chain: string, contract: string, owner: string, tokenId: string) {
    return await this.read(chain, contract, 'balanceOf', this.abi, owner, tokenId);
  }
}

const nftContractService = new NftContractService();
export { nftContractService };
