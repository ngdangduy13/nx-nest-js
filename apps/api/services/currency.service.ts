import currencyRepo from '@api/repositories/currency.repo';
import { priceFeedService } from '@backend/services';
import { networkService } from '@backend/services/smart-contracts';
import { ethers } from 'ethers';
import * as _ from 'lodash';

class CurrencyService {
  async getExchangeRate(
    chain: string,
    priceOracle: string,
    tokenDecimals: number
  ) {
    if (priceOracle === ethers.constants.AddressZero)
      return 1 / Math.pow(10, tokenDecimals);

    const exchangeRate = parseInt(
      await priceFeedService.lastestAnswer(chain, priceOracle)
    );

    const priceOracleDecimals = parseInt(
      await priceFeedService.decimals(chain, priceOracle)
    );

    return exchangeRate / Math.pow(10, priceOracleDecimals + tokenDecimals);
  }

  async updateCurrencies() {
    const networks = networkService.getNetworks();
    const promises = Object.entries(networks).map(async ([chain, network]) => {
      const berc20s = await Promise.all(
        Object.entries(network.config.btokens.berc20.instances).map(
          async ([key, bToken]) => {
            const exchangeRate = await this.getExchangeRate(
              chain,
              bToken.priceOracle,
              bToken.decimals
            );

            return {
              contract: bToken.underlying,
              value: exchangeRate,
              chain,
            };
          }
        )
      );

      const bEther = {
        contract: '0x',
        value: await this.getExchangeRate(
          chain,
          network.config.btokens.bether.priceOracle,
          network.config.btokens.bether.decimals
        ),
        chain,
      };
      return [...berc20s, bEther];
    });

    const currencies = _.flattenDeep(await Promise.all(promises));

    return await currencyRepo.upsertMany(currencies);
  }
}

export default new CurrencyService();
