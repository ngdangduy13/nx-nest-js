import * as ethUtil from 'ethereumjs-util';
import * as sigUtil from 'eth-sig-util';
import { SELLER_STATUS, CREDIT_STATUS } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { SignInRequest } from "@libs/models";
import { AccountRepo } from '@api/repositories';
import { getConfig } from '@api/utils';
import { UpdateProfileRequest } from '@libs/models';


class AccountService {
  async signIn(request: SignInRequest) {
    const msgBufferHex = ethUtil.bufferToHex(Buffer.from(request.message, 'utf8'));
    const address = sigUtil.recoverPersonalSignature({ data: msgBufferHex, sig: request.signature });

    const account = await AccountRepo.upsert(address);
    const token = jwt.sign({
      data: {
        uid: account.id,
        displayName: account.displayName,
        image: account.image,
        commissionFee: account.commissionFee,
        canSell: account.sellerStatus === SELLER_STATUS.VERIFIED,
        canBNPL: account.creditStatus === CREDIT_STATUS.VERIFIED
      }
    }, getConfig('TOKEN_SECRET'), { expiresIn: getConfig('TOKEN_LIFE_TIME') });

    return { token };
  }

  async update(id: string, request: UpdateProfileRequest) {
    await AccountRepo.update(id, request as any);
  }

  async getById(id: string) {
    return await AccountRepo.getById(id);
  }
}

export default new AccountService();
