import { createHandler, Body, Post, Put, Get, ValidationPipe, Param } from '@storyofams/next-api-decorators';
import { QuoteService } from '@api/services';
import { CreateQuoteRequest } from '@libs/models';

class QuoteHandler {
  @Post()
  async create(@Body(ValidationPipe) request: CreateQuoteRequest) {
    return QuoteService.create(request);
  }

  @Get('/:chain/:contract/:tokenId')
  async details(@Param('chain') chainId: string, @Param('hashKey') hashKey: string) {
    return QuoteService.details(chainId, hashKey);
  }
}

export default createHandler(QuoteHandler);
