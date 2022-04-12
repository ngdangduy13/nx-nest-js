import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class NftAttribute {
  //@ApiProperty()
  @IsString()
  trait_type: string;

  //@ApiProperty()
  @IsString()
  value: string;

  //@ApiProperty()
  @IsOptional()
  is_truppa: boolean;
}

export class Payout {
  //@ApiProperty()
  @IsString()
  account: string;

  //@ApiProperty()
  @IsNumber()
  value: number;
}

export class CreateNftRequest {
  //@ApiProperty()
  @IsString()
  chain: string;

  //@ApiProperty()
  @IsString()
  contract: string;

  //@ApiProperty()
  @IsString()
  tokenId: string;

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
  @IsArray()
  signatures: string[];
}
