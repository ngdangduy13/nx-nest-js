export class CreateOrderRequest {
  chain: string;

  transaction_hash: string;

  sellingHash: string;

  buyingHash: string;

  seller: string;

  buyer: string;

  fill: string;

  total: string;

  paid: string;

  block_timestamp: any;
}
