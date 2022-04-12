import { Asset, AssetType } from '@libs/models';
import { utils, ethers } from 'ethers';
import { QuoteAsset, QuoteAssetType } from './quote.helper';

const ASSET_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes(
    'Asset(AssetType assetType,uint256 value)AssetType(bytes4 assetClass,bytes data)'
  )
);
const ASSET_TYPE_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('AssetType(bytes4 assetClass,bytes data)')
);

export class AssetHelper {
  id(str: string) {
    return utils.id(str).substring(0, 10);
  }

  enc(asset: Asset) {
    const abiCoder = new utils.AbiCoder();

    if (
      asset.assetType.assetClass === 'ERC721' ||
      asset.assetType.assetClass === 'ERC1155'
    ) {
      return abiCoder.encode(
        ['address', 'uint256'],
        [asset.assetType.contract, asset.assetType.tokenId]
      );
    } else if (asset.assetType.assetClass === 'ERC721_LAZY') {
      return abiCoder.encode(
        [
          'address',
          'tuple(uint256 tokenId, string tokenURI, tuple(address account, uint256 value)[] creators, tuple(address account, uint256 value)[] royalties, bytes[] signatures)',
        ],
        [
          asset.assetType.contract,
          {
            tokenId: asset.assetType.tokenId,
            tokenURI: asset.assetType.uri,
            creators: asset.assetType.creators,
            royalties: asset.assetType.royalties,
            signatures: asset.assetType.signatures,
          },
        ]
      );
    } else if (asset.assetType.assetClass === 'ERC1155_LAZY') {
      return abiCoder.encode(
        [
          'address',
          'tuple(uint256 tokenId, string tokenURI, uint256 supply, tuple(address account, uint256 value)[] creators, tuple(address account, uint256 value)[] royalties, bytes[] signatures)',
        ],
        [
          asset.assetType.contract,
          {
            tokenId: asset.assetType.tokenId,
            tokenURI: asset.assetType.uri,
            supply: asset.assetType.supply,
            creators: asset.assetType.creators,
            royalties: asset.assetType.royalties,
            signatures: asset.assetType.signatures,
          },
        ]
      );
    } else if (
      asset.assetType.assetClass === 'ETH' ||
      asset.assetType.assetClass === 'ETH_PAY_4'
    ) {
      return '0x';
    } else {
      return abiCoder.encode(['address'], [asset.assetType.contract]);
    }
  }

  hashAssetType(assetType: QuoteAssetType): string {
    const abiCoder = new utils.AbiCoder();
    return utils.keccak256(
      abiCoder.encode(
        ['bytes32', 'bytes4', 'bytes32'],
        [
          ASSET_TYPE_TYPEHASH,
          assetType.assetClass,
          utils.keccak256(assetType.data),
        ]
      )
    );
  }

  hash(asset: QuoteAsset): string {
    const abiCoder = new utils.AbiCoder();
    return utils.keccak256(
      abiCoder.encode(
        ['bytes32', 'bytes32', 'uint256'],
        [ASSET_TYPEHASH, this.hashAssetType(asset.assetType), asset.value]
      )
    );
  }
}

const assetHelper = new AssetHelper();
export { assetHelper };
