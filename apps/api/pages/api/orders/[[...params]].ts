import { createHandler, Body, Post, Get, ValidationPipe, Param } from '@storyofams/next-api-decorators';
import { OrderService } from '@api/services';
import { CreateOrderRequest } from '@libs/models';

class OrderHandler {
  @Post()
  async create(@Body(ValidationPipe) request: CreateOrderRequest) {
    return OrderService.create(request);
  }

  @Get('/:chain/:id')
  async details(@Param('chain') chainId: string, @Param('id') id: string) {
    return OrderService.details(chainId, id);
  }
}

export default createHandler(OrderHandler);
