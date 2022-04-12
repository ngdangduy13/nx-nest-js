import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { Payout } from "../nft";

export class QuoteData {
  @IsString()
  dataType: string;

  // @ApiProperty({type: [NftPayout], required: false})
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Payout)
  payouts: Payout[];

  // @ApiProperty()
  @IsNumber()
  @IsOptional()
  originFees: number;

  // @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isMakeFill: boolean;
}


export class AssetType {
  @IsString()
  "@type": string;

  //@ApiProperty()
  @IsString()
  contract?: string;

  //@ApiProperty()
  @IsString()
  tokenId?: string;

  //@ApiProperty()
  @IsString()
  @IsOptional()
  uri: string;

  //@ApiProperty()
  @IsNumber()
  supply: number;

  //@ApiProperty({type: [NftPayout], required: false})
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Payout)
  creators: Payout[];

  //@ApiProperty({type: [NftPayout], required: false})
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Payout)
  royalties: Payout[];

  //@ApiProperty({required: false})
  @IsString()
  @IsArray()
  signatures: string[];

  @IsString()
  assetClass: string;
}

export class Asset {
  assetType: AssetType;
  value: number;
}


export class CreateQuoteRequest {
  @IsString()
  chain: string;

  @IsString()
  type: string;

  @IsString()
  maker: string;

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested({ always: true })
  @Type(() => Asset)
  make: Asset;

  @IsString()
  taker: string;

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested({ always: true })
  @Type(() => Asset)
  take: Asset;

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested({ always: true })
  @Type(() => QuoteData)
  data: QuoteData;

  @IsString()
  salt: string;

  @IsString()
  signature: string;

  hashKey: string;
}
