import { utils, ethers } from 'ethers';
import { numberHelper } from './number.helper';
import { saltHelper } from './salt.helper';

export type License = {
  creditLimit: string;
  account: string;
  salt: string;
  expires_at: number;
};

const Types = {
  BuyerLicense: [
    { name: 'account', type: 'address' },
    { name: 'creditLimit', type: 'uint256' },
    { name: 'salt', type: 'uint256' },
    { name: 'expires_at', type: 'uint256' },
  ],
};

export class AccountHelper {
  private buildDomain(chainId: number | string, verifyingContract: string) {
    return {
      name: 'MEMBERSHIP',
      version: '1',
      chainId,
      verifyingContract,
    };
  }

  async signBuyer(
    account: any,
    licensor: string,
    providerUrl: string,
    chainId: number | string,
    verifyingContract: string
  ): Promise<string> {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(licensor, provider);

    const license: License = {
      creditLimit: numberHelper.toPlainString(account.credit_limit),
      account: account.id,
      salt: saltHelper.getSalt(),
      expires_at: 0,
    };

    return wallet._signTypedData(
      this.buildDomain(chainId, verifyingContract),
      Types,
      license
    );
  }

  verifyLicense(
    license: License,
    signature: string,
    chainId: number | string,
    verifyingContract: string
  ) {
    return utils.verifyTypedData(
      this.buildDomain(chainId, verifyingContract),
      Types,
      license,
      signature
    );
  }
}

const accountHelper = new AccountHelper();
export { accountHelper };
