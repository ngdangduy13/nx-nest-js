import { CreateOrderRequest } from "@libs/models";
import { OrderRepo } from '@api/repositories';

class OrderService {
  async create(request: CreateOrderRequest) {
    return OrderRepo.upsert(request);
  }

  async details(chain: string, id: string) {
    return await OrderRepo.getById(chain, id);
  }
}

export default new OrderService();
