import { prisma } from '@backend/providers';
import { Prisma } from '@prisma/client';

class CollectionRepo {
  async upsert(collection: Prisma.NftCollectionCreateInput) {
    await prisma.nftCollection.upsert({
      where: {
        chain_contract: {
          chain: collection.chain,
          contract: collection.contract
        },
      },
      update: {},
      create: collection
    });
  }

  async update(collection: Prisma.NftCollectionUpdateInput) {
    await prisma.nftCollection.update({
      where: {
        chain_contract: {
          chain: collection.chain as string,
          contract: collection.contract as string
        },
      },
      data: collection
    });
  }

  async createMany(collections: Prisma.NftCollectionCreateInput[]) {
    return prisma.nftCollection.createMany({
      data: collections,
      skipDuplicates: true
    });
  }

  async getById(chain: string, contract: string) {
    return prisma.nftCollection.findUnique({
      where: {
        chain_contract: {
          chain: chain,
          contract: contract
        },
      }
    });
  }

  async getAll() {
    return prisma.nftCollection.findMany();
  }
}

export default new CollectionRepo();
