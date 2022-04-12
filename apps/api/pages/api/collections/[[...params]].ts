import { createHandler, Body, Post, Get, ValidationPipe, Param } from '@storyofams/next-api-decorators';
import { CollectionService } from '@api/services';
import { CreateCollectionRequest } from '@libs/models';

class CollectionHandler {
  @Post()
  async create(@Body(ValidationPipe) request: CreateCollectionRequest) {
    return CollectionService.create(request);
  }

  @Get('/:chain/:contract')
  async details(@Param('chain') chainId: string, @Param('contract') contract: string) {
    return CollectionService.details(chainId, contract);
  }
}

export default createHandler(CollectionHandler);
