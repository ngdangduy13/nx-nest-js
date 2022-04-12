import currencyService from '@api/services/currency.service';
import { createHandler, Put } from '@storyofams/next-api-decorators';

class CurrencyHandler {
  @Put()
  async updateCurrencies() {
    return currencyService.updateCurrencies();
  }
}

export default createHandler(CurrencyHandler);
