import { prisma } from '@backend/providers';
import { FavoriteNftRequest, ViewNftRequest } from '@libs/models';
import { Prisma } from '@prisma/client';
import * as _ from 'lodash';

prisma.$use(async (params, next) => {
  const result = await next(params)
  if (params.model == 'NftView' && ['upsert', 'create'].includes(params.action)) {
    const data = params.args.data || params.args.create;
    const numberOfViews = await prisma.nftView.count({
      where: {
        chain: data.chain,
        contract: data.contract,
        tokenId: data.tokenId
      }
    });

    await prisma.nft.update({
      where: {
        chain_contract_tokenId: {
          chain: data.chain,
          contract: data.contract,
          tokenId: data.tokenId
        }
      },
      data: {
        numberOfViews: numberOfViews
      }
    });
  }

  return result;
});

prisma.$use(async (params, next) => {
  const result = await next(params)
  if (params.model == 'NftFavorite' && ['upsert', 'create'].includes(params.action)) {
    const data = params.args.data || params.args.create;
    const numberOfFavorites = await prisma.nftFavorite.count({
      where: {
        chain: data.chain,
        contract: data.contract,
        tokenId: data.tokenId
      }
    });

    await prisma.nft.update({
      where: {
        chain_contract_tokenId: {
          chain: data.chain,
          contract: data.contract,
          tokenId: data.tokenId
        }
      },
      data: {
        numberOfFavorites: numberOfFavorites
      }
    });
  }

  return result;
});

class NftRepo {
  async upsertWithCollection(nft: Prisma.NftCreateInput, collection: Prisma.NftCollectionCreateInput) {
    const upsertCollection = prisma.nftCollection.upsert({
      where: {
        chain_contract: {
          chain: collection.chain,
          contract: collection.contract
        },
      },
      update: {},
      create: collection
    });

    const upsertNft = prisma.nft.upsert({
      where: {
        chain_contract_tokenId: {
          chain: collection.chain,
          contract: collection.contract,
          tokenId: nft.tokenId
        },
      },
      update: {},
      create: nft
    });

    await prisma.$transaction([upsertCollection, upsertNft]);
  }

  async addView(ipAddress: string, account: string, request: ViewNftRequest) {
    await prisma.nftView.upsert({
      where: {
        chain_contract_tokenId_account: {
          chain: request.chain,
          contract: request.contract,
          tokenId: request.tokenId,
          account: account
        },
      },
      update: {},
      create: { ...request, account, ipAddress }
    });

    return prisma.nft.findUnique({
      where: {
        chain_contract_tokenId: {
          chain: request.chain,
          contract: request.contract,
          tokenId: request.tokenId
        }
      },
      select: {
        numberOfViews: true
      }
    });
  }

  async addFavorite(account: string, request: FavoriteNftRequest) {
    await prisma.nftFavorite.upsert({
      where: {
        chain_contract_tokenId_account: {
          chain: request.chain,
          contract: request.contract,
          tokenId: request.tokenId,
          account
        },
      },
      update: {},
      create: { ...request, account }
    });

    return prisma.nft.findUnique({
      where: {
        chain_contract_tokenId: {
          chain: request.chain,
          contract: request.contract,
          tokenId: request.tokenId
        }
      },
      select: {
        numberOfFavorites: true
      }
    })
  }

  async getById(chain: string, contract: string, tokenId: string) {
    return prisma.nft.findUnique({
      where: {
        chain_contract_tokenId: { chain, contract, tokenId },
      }
    });
  }

  async search() {
    const request = {
      chain: 'bsc_testnet',
      contract: '0x08736e96a54f911b7d693fcf6ab4e94127e1e1e0',
      sortField: "priceInUsd",
      sortDirection: "DESC",
      offset: 0,
      limit: 10
    }

    const query = `SELECT Nft.hashKey
    FROM (SELECT q.chain,
                 q.makeAssetContract              AS contract,
                 q.makeAssetTokenId               AS tokenId,
                 min(q.takeAssetValue * xr.value) AS priceInUsd
          FROM Quote AS q
                   INNER JOIN Currency AS xr ON q.chain = xr.chain AND q.takeAssetContract = xr.contract
          WHERE q.chain = '${request.chain}' ${request.contract ? `AND q.makeAssetContract = '${request.contract}'` : ''}
          GROUP BY q.chain, q.makeAssetContract, q.makeAssetTokenId) AS q
             INNER JOIN Nft ON Nft.chain = q.chain AND Nft.contract = q.contract AND Nft.tokenId = q.tokenId
             INNER JOIN NftCollection AS c ON Nft.chain = c.chain AND Nft.contract = c.contract
    ORDER BY ${request.sortField} ${request.sortDirection}
    LIMIT ${request.limit} OFFSET ${request.offset};`

    const keys = await prisma.$queryRawUnsafe<{ hashKey: string }[]>(query).then(rows => rows.map(row => row.hashKey));

    const nfts = await prisma.nft.findMany({
      include: {
        makeQuotes: {
          include: {
            takeCurrency: true
          }
        },
        favorites: {
          select: {
            account: true
          }
        }
      },
      where: {
        hashKey: { in: keys }
      }
    });

    return nfts.map(nft => ({
      chain: nft.chain,
      contract: nft.contract,
      tokenId: nft.tokenId,
      uri: nft.uri,
      name: nft.name,
      symbol: nft.symbol,
      image: nft.image,
      description: nft.description,
      numberOfViews: nft.numberOfViews,
      numberOfFavorites: nft.numberOfFavorites,
      quote: _.minBy(nft.makeQuotes.map(q => ({
        hashKey: q.hashKey,
        takeAssetContract: q.takeAssetContract,
        takeAssetValue: q.takeAssetValue,
        priceInUsd: q.takeAssetValue.mul(q.takeCurrency.value)
      })), q => q.priceInUsd)
    }));
  }

  async getByAccount(chain: string, account: string, offset: number, limit: number) {
    const query = prisma.nft.findMany({
      include: {
        makeQuotes: {
          where: {
            isMakeFill: true,
            status: 0
          },
          select: {
            makeAssetValue: true
          },
          take: 1
        },
        _count: true
      },
      where: {
        chain: chain,
        owner: account
      },
      skip: offset,
      take: limit
    });

    const countQuery = prisma.nft.count({
      where: {
        chain: chain,
        owner: account
      }
    });

    const [nfts, count] = await prisma.$transaction([query, countQuery]);
    return {
      total: count,
      page: offset % limit,
      limit: limit,
      result: nfts.map(token => ({
        contract: token.contract,
        tokenId: token.tokenId,
        contractType: "unknown",
        owner: token.owner,
        uri: token.uri,
        supply: token.supply,
        name: token.name,
        symbol: token.symbol
      }))
    };
  }

  async getAll() {
    return prisma.nft.findMany();
  }
}

export default new NftRepo();
