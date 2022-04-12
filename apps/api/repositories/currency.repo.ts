import { prisma } from '@backend/providers';
import { priceFeedService } from '@backend/services';
import { Account, Currency, Prisma } from '@prisma/client';
import { ethers } from 'ethers';

class CurrencyRepo {
  async upsertMany(currencies: Prisma.CurrencyCreateInput[]) {
    const upserts = currencies.map((currency) =>
      prisma.currency.upsert({
        where: {
          chain_contract: {
            chain: currency.chain,
            contract: currency.contract,
          },
        },
        update: {
          value: currency.value,
        },
        create: {
          chain: currency.chain,
          contract: currency.contract,
          value: currency.value,
        },
      })
    );

    return await prisma.$transaction(upserts);
  }
}

export default new CurrencyRepo();
