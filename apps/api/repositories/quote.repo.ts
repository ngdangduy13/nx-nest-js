import { prisma } from '@backend/providers';
import { CreateQuoteRequest } from '@libs/models';
import { Nft, NftCollection } from '@prisma/client';
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

class QuoteRepo {
  async create(quote: CreateQuoteRequest, nft: Nft, collection: NftCollection) {
    nft.description = "abc";
    const upsertCollection = prisma.nftCollection.upsert(
      {
        where: {
          chain_contract: {
            chain: collection.chain,
            contract: collection.contract
          },
        },
        update: {},
        create: collection
      }
    );

    const upsertNft = prisma.nft.upsert(
      {
        where: {
          chain_contract_tokenId: {
            chain: collection.chain,
            contract: collection.contract,
            tokenId: nft.tokenId
          },
        },
        update: {},
        create: {
          chain: nft.chain,
          contract: nft.contract,
          tokenId: nft.tokenId,
          hashKey: this.buildHashKey(nft.chain, nft.contract, nft.tokenId),
          uri: nft.uri,
          name: nft.name,
          symbol: nft.symbol,
          image: nft.image,
          description: nft.description,
          supply: nft.supply,
          attributes: nft.attributes || undefined,
          creators: nft.creators || undefined,
          royalties: nft.royalties || undefined,
          signatures: nft.signatures || undefined,
          owner: nft.owner,
          isLazy: nft.isLazy,
          minted: nft.minted,
        }
      }
    );

    const upsertQuote = prisma.quote.upsert({
      where: {
        chain_hashKey: {
          chain: quote.chain,
          hashKey: quote.hashKey,
        }
      },
      update: {},
      create: {
        chain: quote.chain,
        hashKey: quote.hashKey,
        maker: quote.maker,
        makeAssetClass: quote.make.assetType.assetClass,
        makeAssetContract: quote.make.assetType.contract || '0x',
        makeAssetTokenId: quote.make.assetType.tokenId,
        makeAssetValue: quote.make.value.toString(),
        taker: quote.taker,
        takeAssetClass: quote.take.assetType.assetClass,
        takeAssetContract: quote.take.assetType.contract || '0x',
        takeAssetTokenId: quote.take.assetType.tokenId,
        takeAssetValue: quote.take.value.toString(),
        isMakeFill: quote.data.isMakeFill,
        originFees: quote.data.originFees,
        payouts: quote.data.payouts as any,
        signature: quote.signature
      }
    });
    await prisma.$transaction([upsertCollection, upsertNft, upsertQuote]);
  }

  async getById(chain: string, hashKey: string) {
    return prisma.quote.findUnique({
      where: {
        chain_hashKey: {
          chain: chain,
          hashKey: hashKey
        }
      }
    });
  }

  async getSellingByAccount(chain: string, account: string) {
    return prisma.quote.findMany({
      where: {
        chain: chain,
        maker: account,
        isMakeFill: true,
        // status: 0
      },
      select: {
        chain: true,
        makeAssetContract: true,
        makeAssetTokenId: true,
        makeAssetValue: true
      }
    });
  }

  async getAll() {
    return prisma.quote.findMany();
  }

  buildHashKey(chain: string, contract: string, tokenId: string) {
    return keccak256(toUtf8Bytes(`${chain}$${contract}$${tokenId}`));
  }
}

export default new QuoteRepo();
