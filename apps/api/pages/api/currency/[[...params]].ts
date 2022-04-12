import currencyService from '@api/services/currency.service';
import { createHandler, Put } from '@storyofams/next-api-decorators';

class CurrencyHandler {
  @Put()
  async updateCurrencies() {
    console.log('12312');
    return currencyService.updateCurrencies();
  }
}

export default createHandler(CurrencyHandler);
