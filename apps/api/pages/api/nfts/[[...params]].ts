import { createHandler, Body, Post, Get, ValidationPipe, Param, Query, ParseNumberPipe } from '@storyofams/next-api-decorators';
import { NftService } from '@api/services';
import { CreateNftRequest, FavoriteNftRequest, ViewNftRequest } from '@libs/models';
import { ChainId, IpAddress, UserId } from '@api/decorators';
import { AuthGuard } from '@api/middlewares';

class NftHandler {
  @Post()
  async create(@Body(ValidationPipe) request: CreateNftRequest) {
    return NftService.create(request);
  }

  @Post('/view')
  async view(@IpAddress() ipAddress: string, @UserId() uid: string, @Body(ValidationPipe) request: ViewNftRequest) {
    return NftService.addView(ipAddress, uid, request);
  }

  @Post('/favorite')
  @AuthGuard()
  async favorite(@UserId() uid: string, @Body(ValidationPipe) request: FavoriteNftRequest) {
    return NftService.addFavorite(uid, request);
  }

  @Get('/:account/minted')
  async getMintedNfts(@ChainId() chainId: string, @Param('account') account: string, @Query('cursor') cursor: string, @Query('limit', ParseNumberPipe) limit: number) {
    return NftService.getMintedNfts(chainId, account, cursor, limit);
  }

  @Get('/:account/lazy')
  async getLazyNfts(@ChainId() chainId: string, @Param('account') account: string, @Query('offset', ParseNumberPipe) offset: number, @Query('limit', ParseNumberPipe) limit: number) {
    return NftService.getLazyNfts(chainId, account, offset, limit);
  }

  @Get('/:chain/:contract/:tokenId/owners')
  async owners(@Param('chain') chain: string, @Param('contract') contract: string, @Param('tokenId') tokenId: string) {
    return NftService.getNftOwners(chain, contract, tokenId);
  }

  @Get('/:chain/:contract/:tokenId/transfers')
  async transfers(@Param('chain') chain: string, @Param('contract') contract: string, @Param('tokenId') tokenId: string) {
    return NftService.getNfTransfers(chain, contract, tokenId);
  }

  @Get('/:chain/:contract/:tokenId')
  async details(@UserId() uid: string, @Param('chain') chain: string, @Param('contract') contract: string, @Param('tokenId') tokenId: string) {
    return NftService.details(uid, chain, contract, tokenId);
  }

  @Get()
  async search() {
    return NftService.search();
  }
}

export default createHandler(NftHandler);
