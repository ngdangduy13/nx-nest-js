import { Asset, CreateQuoteRequest, QuoteData } from '@libs/models';
import { utils, ethers } from 'ethers';
import { assetHelper } from './asset.helper';
import { numberHelper } from './number.helper';

export type Quote = {
  maker: string;
  makeAsset: QuoteAsset;

  taker: string;
  takeAsset: QuoteAsset;
  start: number;
  end: number;
  salt: string;
  dataType: string;
  data: string;
  makerSignature: string;
};

export type QuoteAsset = {
  assetType: QuoteAssetType;
  value: string;
};

export type QuoteAssetType = {
  assetClass: string;
  data: string;
};

const QUOTE_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes(
    'Quote(address maker,Asset makeAsset,address taker,Asset takeAsset,uint256 salt,uint256 start,uint256 end,bytes4 dataType,bytes data)Asset(AssetType assetType,uint256 value)AssetType(bytes4 assetClass,bytes data)'
  )
);

const Types = {
  AssetType: [
    { name: 'assetClass', type: 'bytes4' },
    { name: 'data', type: 'bytes' },
  ],
  Asset: [
    { name: 'assetType', type: 'AssetType' },
    { name: 'value', type: 'uint256' },
  ],
  Quote: [
    { name: 'maker', type: 'address' },
    { name: 'makeAsset', type: 'Asset' },
    { name: 'taker', type: 'address' },
    { name: 'takeAsset', type: 'Asset' },
    { name: 'salt', type: 'uint256' },
    { name: 'start', type: 'uint256' },
    { name: 'end', type: 'uint256' },
    { name: 'dataType', type: 'bytes4' },
    { name: 'data', type: 'bytes' },
  ],
};

export class QuoteHelper {
  id(str: string) {
    return utils.id(str).substring(0, 10);
  }

  hashKey(quote: Quote) {
    const abiCoder = new utils.AbiCoder();
    return utils.keccak256(
      abiCoder.encode(
        ['address', 'bytes32', 'bytes32', 'uint256', 'bytes'],
        [
          quote.maker,
          assetHelper.hashAssetType(quote.makeAsset.assetType),
          assetHelper.hashAssetType(quote.takeAsset.assetType),
          quote.salt,
          quote.data,
        ]
      )
    );
  }

  hash(quote: Quote): string {
    const abiCoder = new utils.AbiCoder();
    return utils.keccak256(
      abiCoder.encode(
        [
          'bytes32',
          'address',
          'bytes32',
          'address',
          'bytes32',
          'string',
          'uint256',
          'uint256',
          'uint256',
          'bytes4',
          'bytes32',
        ],
        [
          QUOTE_TYPEHASH,
          quote.maker,
          assetHelper.hash(quote.makeAsset),
          quote.taker,
          assetHelper.hash(quote.takeAsset),
          quote.salt,
          quote.start,
          quote.end,
          quote.dataType,
          utils.keccak256(quote.data),
        ]
      )
    );
  }

  private encQuoteData(data: QuoteData) {
    const abiCoder = new utils.AbiCoder();
    return data
      ? abiCoder.encode(
          [
            'tuple(tuple(address account, uint256 value)[] payouts, uint256 originFees, bool isMakeFill)',
          ],
          [
            {
              payouts: data?.payouts,
              originFees: numberHelper.toPlainString(data?.originFees),
              isMakeFill: data?.isMakeFill,
            },
          ]
        )
      : '0x';
  }

  enc(quote: CreateQuoteRequest): Quote {
    return {
      maker: quote.maker,
      makeAsset: {
        assetType: {
          assetClass: this.id(quote.make.assetType.assetClass),
          data: assetHelper.enc(quote.make),
        },
        value: numberHelper.toPlainString(quote.make?.value),
      },
      taker: quote.taker || ethers.constants.AddressZero,
      takeAsset: {
        assetType: {
          assetClass: this.id(quote.take.assetType.assetClass),
          data: assetHelper.enc(quote.take),
        },
        value: numberHelper.toPlainString(quote.take?.value),
      },
      start: 0,
      end: 0,
      salt: quote.salt,
      dataType: quote.type ? this.id(quote.type) : '0xffffffff',
      data: this.encQuoteData(quote.data),
      makerSignature: quote.signature || '0x',
    };
  }

  private buildDomain(chainId: number | string, verifyingContract: string) {
    return {
      name: 'BEPAY',
      version: '1',
      chainId,
      verifyingContract,
    };
  }

  sign(
    quote: CreateQuoteRequest,
    licensor: string,
    providerUrl: string,
    chainId: number | string,
    verifyingContract: string
  ): Promise<string> {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(licensor, provider);

    return wallet._signTypedData(
      this.buildDomain(chainId, verifyingContract),
      Types,
      this.enc(quote)
    );
  }

  verify(
    quote: Quote,
    signature: string,
    chainId: number | string,
    verifyingContract: string
  ) {
    return utils.verifyTypedData(
      this.buildDomain(chainId, verifyingContract),
      Types,
      quote,
      signature
    );
  }
}

const quoteHelper = new QuoteHelper();
export { quoteHelper };
