import { prisma } from '@backend/providers';
import { CreateOrderRequest } from '@libs/models';
import moment from 'moment';

class OrderRepo {
  async upsert(order: CreateOrderRequest) {
    const sellingQuote = await prisma.quote.findUnique({
      where: { chain_hashKey: { chain: order.chain, hashKey: order.sellingHash } }
    });

    const completed = order.total === order.paid;
    const orderUpsert = prisma.order.upsert({
      where: { chain_id: { chain: order.chain, id: order.transaction_hash } },
      update: {},
      create: {
        chain: order.chain,
        id: order.transaction_hash,
        sellingKey: order.sellingHash,
        buyingKey: order.buyingHash,
        seller: order.seller,
        buyer: order.buyer,
        contract: sellingQuote.makeAssetContract,
        tokenId: sellingQuote.makeAssetTokenId,
        fill: order.fill,
        currency: sellingQuote.takeAssetContract,
        total: order.total,
        dueDate: !completed ? moment(order.block_timestamp).add(4, 'weeks').toDate() : undefined,
        completed,
        createdAt: order.block_timestamp
      }
    });

    const paymentUpsert = prisma.payment.upsert({
      where: { chain_id: { chain: order.chain, id: order.transaction_hash } },
      update: {},
      create: {
        chain: order.chain,
        id: order.transaction_hash,
        orderId: order.transaction_hash,
        amount: order.paid,
        createdAt: order.block_timestamp
      }
    });

    await prisma.$transaction([orderUpsert, paymentUpsert]);
  }

  async getById(chain: string, id: string) {
    return prisma.order.findUnique({
      where: { chain_id: { chain, id } }
    });
  }

  async getByAccount(chain: string, account: string) {
    return prisma.order.findMany({
      where: {
        chain: chain,
        seller: account,
        OR: {
          buyer: account
        }
      }
    });
  }
}

export default new OrderRepo();
