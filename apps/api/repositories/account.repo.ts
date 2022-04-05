import { prisma } from '@api/providers';
import { Account } from '@prisma/client';

class AccountRepo {
  async upsert(address: string) {
    await prisma.account.upsert({
      where: {
        id: address,
      },
      update: {},
      create: {
        id: address
      },
    });

    return this.getById(address);
  }

  async update(id: string, account: Partial<Account>) {
    await prisma.account.update({
      where: { id },
      data: { ...account }
    });
  }

  async createMany(accounts: Account[]) {
    return prisma.account.createMany({
      data: accounts,
      skipDuplicates: true
    });
  }

  async getById(id: string) {
    return prisma.account.findUnique({
      where: { id }
    });
  }

  async getByIds(ids: string[]) {
    return prisma.account.findMany({
      where: { id: { in: ids } }
    });
  }
}

export default new AccountRepo();
