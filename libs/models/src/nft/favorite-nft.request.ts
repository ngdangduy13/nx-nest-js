import { IsString } from "class-validator";

export class FavoriteNftRequest {
  //@ApiProperty()
  @IsString()
  chain: string;

  //@ApiProperty()
  @IsString()
  contract: string;

  //@ApiProperty()
  @IsString()
  tokenId: string;
}
