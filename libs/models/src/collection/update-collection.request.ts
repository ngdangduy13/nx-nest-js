
import { IsString } from 'class-validator';

export class UpdateCollectionRequest {
  @IsString()
  chain: string;

  @IsString()
  address: string;
}
