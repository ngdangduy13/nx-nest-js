import { prisma } from '@backend/providers';
import { priceFeedService } from '@backend/services';
import { Account, Currency } from '@prisma/client';
import { ethers } from 'ethers';

class CurrencyRepo {
  async upsertMany(currencies: Currency[]) {
    const upserts = currencies.map((currency) =>
      prisma.currency.upsert({
        where: {
          chain_contract: {
            chain: 'bsc',
            contract: '0x',
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
